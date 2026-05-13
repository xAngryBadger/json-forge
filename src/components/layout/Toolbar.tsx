import type { IndentSize, ViewMode, Stats } from '../../types'

interface ToolbarProps {
  onFormat: () => void
  onMinify: () => void
  onCopy: () => void
  onExpandAll: () => void
  onCollapseAll: () => void
  indent: IndentSize
  onIndentChange: (size: IndentSize) => void
  viewMode: ViewMode
  stats: Stats | null
}

export function Toolbar({
  onFormat,
  onMinify,
  onCopy,
  onExpandAll,
  onCollapseAll,
  indent,
  onIndentChange,
  viewMode,
  stats,
}: ToolbarProps) {
  return (
    <div
      className="flex items-center justify-between px-3 h-10 border-b text-xs"
      style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-alt)' }}
    >
      <div className="flex items-center gap-2">
        <button
          onClick={onFormat}
          className="px-2 py-1 rounded font-medium transition-colors hover:bg-[var(--color-bg-surface)]"
          style={{ color: 'var(--color-text-2)' }}
          title="Format (Ctrl+L)"
        >
          Format
        </button>
        <button
          onClick={onMinify}
          className="px-2 py-1 rounded font-medium transition-colors hover:bg-[var(--color-bg-surface)]"
          style={{ color: 'var(--color-text-2)' }}
          title="Minify (Ctrl+Shift+M)"
        >
          Minify
        </button>
        <button
          onClick={onCopy}
          className="px-2 py-1 rounded font-medium transition-colors hover:bg-[var(--color-bg-surface)]"
          style={{ color: 'var(--color-text-2)' }}
          title="Copy (Ctrl+S)"
        >
          Copy
        </button>
        <div className="w-px h-4" style={{ backgroundColor: 'var(--color-border)' }} />
        <div className="flex items-center gap-1" style={{ color: 'var(--color-text-3)' }}>
          <span>Indent:</span>
          <select
            value={indent}
            onChange={(e) => onIndentChange(Number(e.target.value) as IndentSize)}
            className="px-1 py-0.5 rounded text-xs"
            style={{
              backgroundColor: 'var(--color-bg-surface)',
              color: 'var(--color-text)',
              border: '1px solid var(--color-border)',
            }}
          >
            <option value={2}>2</option>
            <option value={4}>4</option>
          </select>
        </div>
        {(viewMode === 'tree' || viewMode === 'graph') && (
          <>
            <div className="w-px h-4" style={{ backgroundColor: 'var(--color-border)' }} />
            <button
              onClick={onExpandAll}
              className="px-2 py-1 rounded font-medium transition-colors hover:bg-[var(--color-bg-surface)]"
              style={{ color: 'var(--color-text-2)' }}
            >
              Expand All
            </button>
            <button
              onClick={onCollapseAll}
              className="px-2 py-1 rounded font-medium transition-colors hover:bg-[var(--color-bg-surface)]"
              style={{ color: 'var(--color-text-2)' }}
            >
              Collapse All
            </button>
          </>
        )}
      </div>
      {stats && (
        <div className="flex items-center gap-3" style={{ color: 'var(--color-text-3)' }}>
          <span>{stats.nodeCount.toLocaleString()} nodes</span>
          <span>depth {stats.maxDepth}</span>
          <span>{formatBytes(stats.sizeBytes)}</span>
        </div>
      )}
    </div>
  )
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
