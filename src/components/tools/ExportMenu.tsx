import { useState, useCallback, useRef, useEffect } from 'react'
import { jsonToCsv, jsonToYaml, inferJsonSchema, exportJson } from '../../lib/converters'
import type { IndentSize } from '../../types'

interface ExportMenuProps {
  data: unknown
  indent: IndentSize
  onToast: (text: string) => void
}

export function ExportMenu({ data, indent, onToast }: ExportMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  const download = useCallback(
    (content: string, filename: string, mimeType: string) => {
      const blob = new Blob([content], { type: mimeType })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
      URL.revokeObjectURL(url)
      onToast(`Exported ${filename}`)
      setIsOpen(false)
    },
    [onToast],
  )

  const handleExportCsv = useCallback(() => {
    try {
      const csv = jsonToCsv(data)
      download(csv, 'data.csv', 'text/csv')
    } catch (e) {
      onToast(`CSV export failed: ${e instanceof Error ? e.message : 'Unknown error'}`)
    }
  }, [data, download, onToast])

  const handleExportYaml = useCallback(() => {
    try {
      const yaml = jsonToYaml(data)
      download(yaml, 'data.yaml', 'text/yaml')
    } catch (e) {
      onToast(`YAML export failed: ${e instanceof Error ? e.message : 'Unknown error'}`)
    }
  }, [data, download, onToast])

  const handleExportSchema = useCallback(() => {
    try {
      const schema = inferJsonSchema(data)
      download(schema, 'schema.json', 'application/json')
    } catch (e) {
      onToast(`Schema export failed: ${e instanceof Error ? e.message : 'Unknown error'}`)
    }
  }, [data, download, onToast])

  const handleExportJson = useCallback(() => {
    try {
      const json = exportJson(data, indent)
      download(json, 'data.json', 'application/json')
    } catch (e) {
      onToast(`JSON export failed: ${e instanceof Error ? e.message : 'Unknown error'}`)
    }
  }, [data, indent, download, onToast])

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-2 py-1 rounded text-xs font-medium transition-colors hover:bg-[var(--color-bg-surface)]"
        style={{ color: 'var(--color-text-2)' }}
      >
        Export ▾
      </button>
      {isOpen && (
        <div
          className="absolute right-0 top-full mt-1 rounded-lg shadow-lg border z-50 py-1 min-w-[140px]"
          style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)' }}
        >
          <button onClick={handleExportJson} className="w-full text-left px-3 py-1.5 text-xs hover:bg-[var(--color-bg-surface)]" style={{ color: 'var(--color-text)' }}>
            JSON
          </button>
          <button onClick={handleExportCsv} className="w-full text-left px-3 py-1.5 text-xs hover:bg-[var(--color-bg-surface)]" style={{ color: 'var(--color-text)' }}>
            CSV
          </button>
          <button onClick={handleExportYaml} className="w-full text-left px-3 py-1.5 text-xs hover:bg-[var(--color-bg-surface)]" style={{ color: 'var(--color-text)' }}>
            YAML
          </button>
          <button onClick={handleExportSchema} className="w-full text-left px-3 py-1.5 text-xs hover:bg-[var(--color-bg-surface)]" style={{ color: 'var(--color-text)' }}>
            JSON Schema
          </button>
        </div>
      )}
    </div>
  )
}
