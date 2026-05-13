import { useCallback, useRef, useEffect } from 'react'
import { EditorView } from '@codemirror/view'
import { EditorState } from '@codemirror/state'
import { json, jsonParseLinter } from '@codemirror/lang-json'
import { linter } from '@codemirror/lint'
import { basicSetup } from 'codemirror'
import { oneDark } from '@codemirror/theme-one-dark'

interface JsonEditorProps {
  value: string
  onChange: (value: string) => void
  isDark: boolean
  error?: string | null
}

export function JsonEditor({ value, onChange, isDark }: JsonEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)
  const onChangeRef = useRef(onChange)
  const valueRef = useRef(value)
  const isDarkRef = useRef(isDark)

  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  useEffect(() => {
    valueRef.current = value
  }, [value])

  useEffect(() => {
    isDarkRef.current = isDark
  }, [isDark])

  useEffect(() => {
    if (!containerRef.current) return

    const updateListener = EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        onChangeRef.current(update.state.doc.toString())
      }
    })

    const state = EditorState.create({
      doc: valueRef.current,
      extensions: [
        basicSetup,
        json(),
        linter(jsonParseLinter()),
        updateListener,
        ...(isDarkRef.current ? [oneDark] : []),
        EditorView.theme({
          '&': { height: '100%' },
          '.cm-scroller': { overflow: 'auto', fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace", fontSize: '13px' },
          '.cm-gutters': { backgroundColor: 'var(--color-bg-alt)', borderRight: '1px solid var(--color-border)' },
        }),
      ],
    })

    const view = new EditorView({
      state,
      parent: containerRef.current,
    })

    viewRef.current = view

    return () => {
      view.destroy()
    }
  }, [isDark])

  useEffect(() => {
    const view = viewRef.current
    if (!view) return
    const currentDoc = view.state.doc.toString()
    if (currentDoc !== value) {
      view.dispatch({
        changes: { from: 0, to: currentDoc.length, insert: value },
      })
    }
  }, [value])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const files = e.dataTransfer.files
    if (files.length > 0) {
      const file = files[0]
      if (file.name.endsWith('.json') || file.type === 'application/json') {
        const reader = new FileReader()
        reader.onload = (ev) => {
          const text = ev.target?.result
          if (typeof text === 'string') {
            onChangeRef.current(text)
          }
        }
        reader.readAsText(file)
      }
    }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  return (
    <div
      ref={containerRef}
      className="h-full w-full"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    />
  )
}
