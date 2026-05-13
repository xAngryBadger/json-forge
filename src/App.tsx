import { useState, useCallback, useEffect, useMemo, lazy, Suspense } from 'react'
import { Header } from './components/layout/Header'
import { SplitPane } from './components/layout/SplitPane'
import { Toolbar } from './components/layout/Toolbar'
import { JsonEditor } from './components/input/JsonEditor'
import { DropZone } from './components/input/DropZone'
import { UrlFetcher } from './components/input/UrlFetcher'
import { TreeView } from './components/tree/TreeView'
import { JsonPathQuery } from './components/tools/JsonPathQuery'
import { TypeGenerator } from './components/tools/TypeGenerator'
import { ExportMenu } from './components/tools/ExportMenu'
import { StatsBar } from './components/tools/StatsBar'
import { useJsonParser } from './hooks/useJsonParser'
import { useJsonPath } from './hooks/useJsonPath'
import { useVirtualTree } from './hooks/useVirtualTree'
import { useUrlState } from './hooks/useUrlState'
import { SAMPLE_JSON } from './lib'
import { countNodes, maxDepth } from './lib/type-inferrer'
import { formatJson, minifyJson } from './lib/format'
import copy from 'copy-to-clipboard'
import type { ViewMode, ThemeMode, IndentSize, Stats, ToastMessage } from './types'

const GraphView = lazy(() => import('./components/graph/GraphView').then((m) => ({ default: m.GraphView })))
const DiffView = lazy(() => import('./components/diff/DiffView').then((m) => ({ default: m.DiffView })))

function App() {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const stored = localStorage.getItem('json-forge-theme')
    if (stored === 'light' || stored === 'dark') return stored
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })
  const [viewMode, setViewMode] = useState<ViewMode>('tree')
  const [indent, setIndent] = useState<IndentSize>(2)
  const [toasts, setToasts] = useState<ToastMessage[]>([])
  const [showRestClient, setShowRestClient] = useState(false)

  const { input, result, setInput } = useJsonParser(150)
  const { pathString, selectNode, clearSelection } = useJsonPath()
  const { flatNodes, toggleCollapse, collapseAll, expandAll, setMatchedPaths } = useVirtualTree(result.data)
  const { readFromUrl, writeToUrl } = useUrlState()

  const [diffLeft, setDiffLeft] = useState('')
  const [diffRight, setDiffRight] = useState('')

  useEffect(() => {
    const urlData = readFromUrl()
    if (urlData !== null) {
      setInput(JSON.stringify(urlData, null, 2))
    } else {
      setInput(SAMPLE_JSON)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (result.data !== null) {
      writeToUrl(result.data)
    }
  }, [result.data, writeToUrl])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('json-forge-theme', theme)
  }, [theme])

  const stats = useMemo<Stats | null>(() => {
    if (!result.data) return null
    return {
      nodeCount: countNodes(result.data),
      maxDepth: maxDepth(result.data),
      sizeBytes: new Blob([input]).size,
    }
  }, [result.data, input])

  const showToast = useCallback((text: string) => {
    const id = `toast-${Date.now()}`
    setToasts((prev) => [...prev, { id, text, visible: true }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 2000)
  }, [])

  const handleThemeToggle = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }, [])

  const handleFormat = useCallback(() => {
    if (result.data !== null) {
      const formatted = formatJson(result.data, indent)
      setInput(formatted)
      showToast('Formatted')
    }
  }, [result.data, indent, setInput, showToast])

  const handleMinify = useCallback(() => {
    if (result.data !== null) {
      const minified = minifyJson(result.data)
      setInput(minified)
      showToast('Minified')
    }
  }, [result.data, setInput, showToast])

  const handleCopy = useCallback(() => {
    if (input) {
      copy(input)
      showToast('Copied to clipboard')
    }
  }, [input, showToast])

  const handleFileLoad = useCallback(
    (content: string) => {
      setInput(content)
      showToast('File loaded')
    },
    [setInput, showToast],
  )

  const handleRestResponse = useCallback(
    (json: string, status: number, latency: number) => {
      setInput(json)
      showToast(`Response: ${status} (${latency}ms)`)
    },
    [setInput, showToast],
  )

  const handleViewModeChange = useCallback(
    (mode: ViewMode) => {
      setViewMode(mode)
      if (mode === 'diff') {
        setDiffLeft(input)
        setDiffRight('')
      }
    },
    [input],
  )

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
        e.preventDefault()
        handleFormat()
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'M') {
        e.preventDefault()
        handleMinify()
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        handleCopy()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [handleFormat, handleMinify, handleCopy])

  const selectedNodeId = useMemo(() => {
    for (const node of flatNodes) {
      if (node.pathString === pathString) return node.id
    }
    return null
  }, [flatNodes, pathString])

  const isDark = theme === 'dark'

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden" style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }}>
      <Header
        theme={theme}
        onThemeToggle={handleThemeToggle}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
      />
      <Toolbar
        onFormat={handleFormat}
        onMinify={handleMinify}
        onCopy={handleCopy}
        onExpandAll={expandAll}
        onCollapseAll={collapseAll}
        indent={indent}
        onIndentChange={setIndent}
        viewMode={viewMode}
        stats={stats}
      />
      <div className="flex items-center gap-2 px-3 py-1 border-b" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-alt)' }}>
        <TypeGenerator data={result.data} />
        <ExportMenu data={result.data} indent={indent} onToast={showToast} />
        <button
          onClick={() => setShowRestClient(!showRestClient)}
          className="px-2 py-1 rounded text-xs font-medium transition-colors hover:bg-[var(--color-bg-surface)]"
          style={{ color: 'var(--color-text-2)' }}
        >
          REST {showRestClient ? '✕' : '⟶'}
        </button>
      </div>
      {showRestClient && <UrlFetcher onResponse={handleRestResponse} />}

      <div className="flex-1 overflow-hidden">
        <SplitPane defaultSplit={40}>
          <div className="h-full relative">
            <JsonEditor value={input} onChange={setInput} isDark={isDark} error={result.error} />
            <DropZone onFileLoad={handleFileLoad} />
            {result.error && (
              <div
                className="absolute bottom-0 left-0 right-0 px-3 py-2 text-xs font-mono border-t"
                style={{
                  backgroundColor: 'var(--color-bg-alt)',
                  borderColor: 'var(--color-removed)',
                  color: 'var(--color-removed)',
                }}
              >
                Parse error{result.errorLine ? ` (line ${result.errorLine})` : ''}: {result.error}
              </div>
            )}
          </div>
          <div className="h-full flex flex-col overflow-hidden">
            {viewMode === 'tree' && (
              <>
                <JsonPathQuery
                  data={result.data}
                  onMatch={setMatchedPaths}
                  onClearMatch={() => setMatchedPaths(new Set())}
                />
                <div className="flex-1 overflow-hidden">
                  <TreeView
                    flatNodes={flatNodes}
                    pathString={pathString}
                    onToggle={toggleCollapse}
                    onSelect={selectNode}
                    onClearPath={clearSelection}
                    onToast={showToast}
                    selectedNodeId={selectedNodeId}
                  />
                </div>
              </>
            )}
            {viewMode === 'graph' && (
              <div className="h-full">
                <Suspense fallback={<div className="p-4 text-sm" style={{ color: 'var(--color-text-3)' }}>Loading graph...</div>}>
                <GraphView
                  data={result.data}
                  flatNodes={flatNodes}
                  onSelectNode={selectNode}
                  isDark={isDark}
                  />
                </Suspense>
              </div>
            )}
            {viewMode === 'diff' && (
              <Suspense fallback={<div className="p-4 text-sm" style={{ color: 'var(--color-text-3)' }}>Loading diff...</div>}>
                <DiffView
                  leftInput={diffLeft}
                  rightInput={diffRight}
                  setLeftInput={setDiffLeft}
                  setRightInput={setDiffRight}
                  isValidLeft={(() => { try { JSON.parse(diffLeft); return true } catch { return false } })()}
                  isValidRight={(() => { try { JSON.parse(diffRight); return true } catch { return false } })()}
                  isDark={isDark}
                />
              </Suspense>
            )}
            {viewMode === 'raw' && (
              <pre
                className="h-full overflow-auto p-3 text-[13px] font-mono"
                style={{ color: 'var(--color-text)' }}
              >
                {result.data ? formatJson(result.data, indent) : input}
              </pre>
            )}
          </div>
        </SplitPane>
      </div>
      <StatsBar stats={stats} />

      <div className="fixed bottom-12 right-4 z-50 flex flex-col gap-1">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="px-3 py-1.5 rounded-lg shadow-lg text-xs font-medium animate-in"
            style={{
              backgroundColor: 'var(--color-accent)',
              color: '#fff',
            }}
          >
            {t.text}
          </div>
        ))}
      </div>
    </div>
  )
}

export default App
