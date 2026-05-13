import { useRef, useCallback, useEffect } from 'react'
import { Virtuoso } from 'react-virtuoso'
import type { FlatNode } from '../../types'
import { TreeNode } from './TreeNode'
import { PathBreadcrumb } from './PathBreadcrumb'

interface TreeViewProps {
  flatNodes: (FlatNode & { matched?: boolean })[]
  pathString: string
  onToggle: (nodeId: string) => void
  onSelect: (path: (string | number)[]) => void
  onClearPath: () => void
  onToast: (text: string) => void
  selectedNodeId: string | null
  highlightedNodeId?: string | null
}

export function TreeView({
  flatNodes,
  pathString,
  onToggle,
  onSelect,
  onClearPath,
  onToast,
  highlightedNodeId,
}: TreeViewProps) {
  const virtuosoRef = useRef<React.ComponentRef<typeof Virtuoso> | null>(null)
  const nodeIndexMapRef = useRef(new Map<string, number>())

  useEffect(() => {
    const map = new Map<string, number>()
    flatNodes.forEach((node, idx) => map.set(node.id, idx))
    nodeIndexMapRef.current = map
  }, [flatNodes])

  useEffect(() => {
    if (highlightedNodeId) {
      const idx = nodeIndexMapRef.current.get(highlightedNodeId)
      if (idx !== undefined && virtuosoRef.current) {
        virtuosoRef.current.scrollToIndex({ index: idx, behavior: 'smooth' })
      }
    }
  }, [highlightedNodeId])

  const rowRenderer = useCallback(
    (index: number) => {
      const node = flatNodes[index]
      if (!node) return null
      return (
        <TreeNode
          key={node.id}
          node={node}
          onToggle={onToggle}
          onSelect={onSelect}
          onToast={onToast}
        />
      )
    },
    [flatNodes, onToggle, onSelect, onToast],
  )

  return (
    <div className="h-full flex flex-col">
      <PathBreadcrumb pathString={pathString} onClear={onClearPath} />
      <div className="flex-1 overflow-hidden">
        <Virtuoso
          ref={virtuosoRef as React.Ref<React.ComponentRef<typeof Virtuoso>>}
          totalCount={flatNodes.length}
          itemContent={rowRenderer}
          followOutput="auto"
          overscan={200}
          className="h-full"
        />
      </div>
    </div>
  )
}
