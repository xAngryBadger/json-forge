import { useState, useMemo, useCallback } from 'react'
import { inferType } from '../../lib/type-inferrer'

interface TypeGeneratorProps {
  data: unknown
}

export function TypeGenerator({ data }: TypeGeneratorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [rootName, setRootName] = useState('Root')

  const types = useMemo(() => {
    try {
      return inferType(data, rootName || 'Root')
    } catch {
      return '// Could not infer types'
    }
  }, [data, rootName])

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(types)
  }, [types])

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="px-2 py-1 rounded text-xs font-medium transition-colors hover:bg-[var(--color-bg-surface)]"
        style={{ color: 'var(--color-text-2)' }}
        title="Generate TypeScript types"
      >
        TS Types
      </button>
    )
  }

  return (
    <div className="border-b" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-alt)' }}>
      <div className="flex items-center gap-2 px-3 py-1.5">
        <span className="text-[10px] font-medium" style={{ color: 'var(--color-text-3)' }}>TypeScript:</span>
        <input
          type="text"
          value={rootName}
          onChange={(e) => setRootName(e.target.value)}
          placeholder="RootName"
          className="w-24 px-2 py-0.5 rounded text-xs font-mono"
          style={{
            backgroundColor: 'var(--color-bg-surface)',
            color: 'var(--color-text)',
            border: '1px solid var(--color-border)',
          }}
        />
        <button
          onClick={handleCopy}
          className="px-2 py-0.5 rounded text-xs font-medium"
          style={{ backgroundColor: 'var(--color-accent)', color: '#fff' }}
        >
          Copy
        </button>
        <button
          onClick={() => setIsOpen(false)}
          className="px-2 py-0.5 rounded text-xs"
          style={{ color: 'var(--color-text-3)' }}
        >
          Close
        </button>
      </div>
      <pre
        className="px-3 pb-2 text-[12px] font-mono overflow-auto max-h-48"
        style={{ color: 'var(--color-text)' }}
      >
        {types}
      </pre>
    </div>
  )
}
