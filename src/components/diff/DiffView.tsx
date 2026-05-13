import { lazy, Suspense, useState } from 'react'
import { JsonEditor } from '../input/JsonEditor'
import { SplitPane } from '../layout/SplitPane'

const ReactDiffViewer = lazy(() => import('react-diff-viewer-continued'))

interface DiffViewProps {
  leftInput: string
  rightInput: string
  setLeftInput: (v: string) => void
  setRightInput: (v: string) => void
  isValidLeft: boolean
  isValidRight: boolean
  isDark: boolean
}

export function DiffView({
  leftInput,
  rightInput,
  setLeftInput,
  setRightInput,
  isDark,
}: DiffViewProps) {
  const [splitMode, setSplitMode] = useState<'split' | 'inline'>('split')
  const [showInputs, setShowInputs] = useState(true)

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-2 px-3 py-2 border-b" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-alt)' }}>
        <button
          onClick={() => setSplitMode('split')}
          className="px-2 py-0.5 rounded text-xs"
          style={{
            backgroundColor: splitMode === 'split' ? 'var(--color-accent)' : 'transparent',
            color: splitMode === 'split' ? '#fff' : 'var(--color-text-2)',
          }}
        >
          Split
        </button>
        <button
          onClick={() => setSplitMode('inline')}
          className="px-2 py-0.5 rounded text-xs"
          style={{
            backgroundColor: splitMode === 'inline' ? 'var(--color-accent)' : 'transparent',
            color: splitMode === 'inline' ? '#fff' : 'var(--color-text-2)',
          }}
        >
          Inline
        </button>
        <div className="w-px h-4" style={{ backgroundColor: 'var(--color-border)' }} />
        <button
          onClick={() => setShowInputs(!showInputs)}
          className="px-2 py-0.5 rounded text-xs"
          style={{
            backgroundColor: showInputs ? 'var(--color-accent)' : 'transparent',
            color: showInputs ? '#fff' : 'var(--color-text-2)',
          }}
        >
          {showInputs ? 'Hide Inputs' : 'Show Inputs'}
        </button>
      </div>
      {showInputs && (
        <div className="h-48 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <SplitPane defaultSplit={50}>
            <div className="h-full flex flex-col">
              <div className="px-3 py-1 text-xs border-b" style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-3)', backgroundColor: 'var(--color-bg-alt)' }}>Original</div>
              <div className="flex-1">
                <JsonEditor value={leftInput} onChange={setLeftInput} isDark={isDark} />
              </div>
            </div>
            <div className="h-full flex flex-col">
              <div className="px-3 py-1 text-xs border-b" style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-3)', backgroundColor: 'var(--color-bg-alt)' }}>Modified</div>
              <div className="flex-1">
                <JsonEditor value={rightInput} onChange={setRightInput} isDark={isDark} />
              </div>
            </div>
          </SplitPane>
        </div>
      )}
      <div className="flex-1 overflow-auto">
        <Suspense fallback={<div className="p-4 text-sm" style={{ color: 'var(--color-text-3)' }}>Loading diff viewer...</div>}>
          <ReactDiffViewer
            oldValue={leftInput}
            newValue={rightInput}
            splitView={splitMode === 'split'}
            useDarkTheme={isDark}
            leftTitle="Original"
            rightTitle="Modified"
            styles={{
              diffContainer: {
                '& pre': { fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace", fontSize: '12px' },
              },
            }}
          />
        </Suspense>
      </div>
    </div>
  )
}
