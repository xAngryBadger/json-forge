import { useState, useCallback } from 'react'
import { JSONPath } from 'jsonpath-plus'

interface JsonPathQueryProps {
  data: unknown
  onMatch: (paths: Set<string>) => void
  onClearMatch: () => void
}

export function JsonPathQuery({ data, onMatch, onClearMatch }: JsonPathQueryProps) {
  const [query, setQuery] = useState('')

  const handleQuery = useCallback(() => {
    if (!query.trim()) {
      onClearMatch()
      return
    }
    try {
      const results = JSONPath({ path: query, json: data as Record<string, unknown>, resultType: 'pointer' }) as unknown as string[]
      const paths = new Set<string>()
      for (const ptr of results) {
        let pathStr = '$'
        if (ptr !== '' && ptr !== '/') {
          const parts = ptr.split('/').slice(1)
          for (const part of parts) {
            const num = Number(part)
            if (!isNaN(num) && part === String(num)) {
              pathStr += `[${part}]`
            } else if (/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(part)) {
              pathStr += `.${part}`
            } else {
              pathStr += `['${part}']`
            }
          }
        }
        paths.add(pathStr)
      }
      onMatch(paths)
    } catch {
      onClearMatch()
    }
  }, [query, data, onMatch, onClearMatch])

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 border-b" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-alt)' }}>
      <span className="text-[10px] font-medium" style={{ color: 'var(--color-text-3)' }}>JSONPath:</span>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="$.store.book[*].title"
        className="flex-1 px-2 py-1 rounded text-xs font-mono"
        style={{
          backgroundColor: 'var(--color-bg-surface)',
          color: 'var(--color-text)',
          border: '1px solid var(--color-border)',
        }}
        onKeyDown={(e) => e.key === 'Enter' && handleQuery()}
      />
      <button
        onClick={handleQuery}
        className="px-2 py-1 rounded text-xs font-medium"
        style={{ backgroundColor: 'var(--color-accent)', color: '#fff' }}
      >
        Query
      </button>
      {query && (
        <button
          onClick={() => { setQuery(''); onClearMatch() }}
          className="px-2 py-1 rounded text-xs"
          style={{ color: 'var(--color-text-3)' }}
        >
          Clear
        </button>
      )}
    </div>
  )
}
