import { useCallback } from 'react'
import copy from 'copy-to-clipboard'
import type { FlatNode } from '../../types'

interface TreeNodeProps {
  node: FlatNode & { matched?: boolean }
  onToggle: (nodeId: string) => void
  onSelect: (path: (string | number)[]) => void
  onToast: (text: string) => void
}

export function TreeNode({ node, onToggle, onSelect, onToast }: TreeNodeProps) {
  const handleToggle = useCallback(() => {
    onToggle(node.id)
  }, [node.id, onToggle])

  const handleSelect = useCallback(() => {
    onSelect(node.path)
  }, [node.path, onSelect])

  const handleCopyValue = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      const value = node.hasChildren
        ? JSON.stringify(node.value, null, 2)
        : String(node.value)
      copy(value)
      onToast('Value copied')
    },
    [node.value, node.hasChildren, onToast],
  )

  const handleCopyPath = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      copy(node.pathString)
      onToast('Path copied')
    },
    [node.pathString, onToast],
  )

  const valueDisplay = getValueDisplay(node)
  const keyColor = typeof node.key === 'number' ? 'var(--color-text-3)' : 'var(--color-key)'
  const valueColor = getValueColor(node.type)

  return (
    <div
      className={`flex items-center group cursor-pointer hover:bg-[var(--color-bg-surface)] transition-colors ${node.matched ? 'bg-[var(--color-bg-surface)]' : ''}`}
      style={{ paddingLeft: `${node.depth * 16 + 8}px`, minHeight: '22px' }}
      onClick={handleSelect}
    >
      <span className="w-10 flex-shrink-0 text-right pr-2 text-[10px] font-mono select-none" style={{ color: 'var(--color-text-3)' }}>
        {node.lineNumber}
      </span>

      <span className="w-4 flex-shrink-0 text-center select-none text-[10px]" style={{ color: 'var(--color-text-3)' }}>
        {node.hasChildren && (
          <button onClick={handleToggle} className="hover:text-[var(--color-text)] transition-colors">
            {node.collapsed ? '▶' : '▼'}
          </button>
        )}
      </span>

      <span className="font-mono text-[13px] truncate" style={{ color: keyColor }}>
        {typeof node.key === 'number' ? (
          <>{node.key}</>
        ) : node.key !== '' ? (
          <>{node.key}:</>
        ) : null}
      </span>

      <span className="font-mono text-[13px] ml-1 truncate" style={{ color: valueColor }}>
        {node.hasChildren ? (
          <>
            {node.type === 'array' ? '[' : '{'}
            {node.collapsed && (
              <span className="ml-0.5 px-1 rounded text-[10px] font-sans" style={{ backgroundColor: 'var(--color-bg-surface)', color: 'var(--color-text-3)' }}>
                {node.childCount}
              </span>
            )}
            {!node.collapsed && <span className="opacity-40">{valueDisplay}</span>}
          </>
        ) : (
          valueDisplay
        )}
      </span>

      {node.hasChildren && !node.collapsed && (
        <span className="font-mono text-[13px] opacity-40" style={{ color: valueColor }}>
          {node.type === 'array' ? ']' : '}'}
        </span>
      )}
      {node.hasChildren && node.collapsed && (
        <span className="font-mono text-[13px]" style={{ color: valueColor }}>
          {node.type === 'array' ? ' ]' : ' }'}
        </span>
      )}

      <span className="ml-auto mr-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={handleCopyValue}
          className="px-1.5 py-0.5 rounded text-[10px] font-sans transition-colors hover:bg-[var(--color-bg-surface)]"
          style={{ color: 'var(--color-text-3)' }}
          title="Copy value"
        >
          Copy
        </button>
        <button
          onClick={handleCopyPath}
          className="px-1.5 py-0.5 rounded text-[10px] font-sans transition-colors hover:bg-[var(--color-bg-surface)]"
          style={{ color: 'var(--color-text-3)' }}
          title="Copy path"
        >
          Path
        </button>
      </span>
    </div>
  )
}

function getValueDisplay(node: FlatNode): string {
  if (node.hasChildren) {
    return ''
  }
  if (node.type === 'string') return `"${String(node.value)}"`
  if (node.type === 'null') return 'null'
  return String(node.value)
}

function getValueColor(type: FlatNode['type']): string {
  switch (type) {
    case 'string': return 'var(--color-string)'
    case 'number': return 'var(--color-number)'
    case 'boolean': return 'var(--color-boolean)'
    case 'null': return 'var(--color-null)'
    case 'object': return 'var(--color-text-2)'
    case 'array': return 'var(--color-text-2)'
    default: return 'var(--color-text)'
  }
}
