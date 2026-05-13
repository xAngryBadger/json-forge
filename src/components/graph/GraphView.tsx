import { useCallback, useMemo } from 'react'
import type { Edge, Node } from 'reactflow'
import ReactFlow, { Controls, MiniMap, Background, useNodesState, useEdgesState } from 'reactflow'
import 'reactflow/dist/style.css'
import type { FlatNode } from '../../types'

interface GraphViewProps {
  data: unknown
  flatNodes: (FlatNode & { matched?: boolean })[]
  onSelectNode: (path: (string | number)[]) => void
  isDark: boolean
}

interface NodeMeta {
  path: (string | number)[]
}

const nodeMetaMap = new Map<string, NodeMeta>()

function buildGraphData(data: unknown): { nodes: Node[]; edges: Edge[] } {
  nodeMetaMap.clear()
  const nodes: Node[] = []
  const edges: Edge[] = []
  let nodeIdx = 0
  const colWidth = 160
  const depthCounts = new Map<number, number>()

  function addNode(
    value: unknown,
    key: string | number,
    path: (string | number)[],
    depth: number,
    parentId: string | null,
  ): string {
    const id = `gnode-${nodeIdx++}`
    nodeMetaMap.set(id, { path })

    const isContainer = value !== null && typeof value === 'object'
    const count = depthCounts.get(depth) ?? 0
    depthCounts.set(depth, count + 1)

    const label = typeof key === 'number'
      ? `[${key}]`
      : key === ''
        ? '$'
        : key

    const nodeType = isContainer
      ? (Array.isArray(value) ? 'array' : 'object')
      : 'primitive'

    const displayValue = isContainer
      ? Array.isArray(value)
        ? `[${(value as unknown[]).length}]`
        : `{${Object.keys(value as Record<string, unknown>).length}}`
      : value === null
        ? 'null'
        : typeof value === 'string'
          ? `"${(value as string).slice(0, 16)}${(value as string).length > 16 ? '…' : ''}"`
          : String(value)

    const color = nodeType === 'object'
      ? '#6366f1'
      : nodeType === 'array'
        ? '#a855f7'
        : '#6b7280'

    nodes.push({
      id,
      type: 'default',
      data: {
        label: (
          <div className="text-center" style={{ minWidth: 60 }}>
            <div className="font-mono text-xs font-bold truncate" style={{ maxWidth: 140 }}>{label}</div>
            <div className="font-mono text-[10px] opacity-75 truncate" style={{ maxWidth: 140 }}>{displayValue}</div>
          </div>
        ),
      },
      position: { x: count * colWidth, y: depth * 110 },
      style: {
        backgroundColor: color,
        color: '#fff',
        borderRadius: '8px',
        fontSize: '11px',
        padding: '6px 12px',
        border: 'none',
      },
    })

    if (parentId) {
      edges.push({
        id: `edge-${edges.length}`,
        source: parentId,
        target: id,
        label: String(key),
        type: 'smoothstep',
        style: { stroke: '#6b7280', strokeWidth: 1 },
        labelStyle: { fontSize: 10, fill: '#6b7280' },
      })
    }

    if (isContainer && depth < 6) {
      if (Array.isArray(value)) {
        value.forEach((item, i) => {
          addNode(item, i, [...path, i], depth + 1, id)
        })
      } else {
        const obj = value as Record<string, unknown>
        for (const [k, v] of Object.entries(obj)) {
          addNode(v, k, [...path, k], depth + 1, id)
        }
      }
    }

    return id
  }

  addNode(data, '', [], 0, null)
  return { nodes, edges }
}

export function GraphView({ data, onSelectNode, isDark }: GraphViewProps) {
  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => buildGraphData(data), [data])

  const [rfNodes, setRfNodes, onRfNodesChange] = useNodesState(initialNodes)
  const [rfEdges, setRfEdges, onRfEdgesChange] = useEdgesState(initialEdges)

  useMemo(() => {
    setRfNodes(initialNodes)
    setRfEdges(initialEdges)
  }, [initialNodes, initialEdges, setRfNodes, setRfEdges])

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      const meta = nodeMetaMap.get(node.id)
      if (meta) {
        onSelectNode(meta.path)
      }
    },
    [onSelectNode],
  )

  return (
    <div className="h-full w-full" style={{ backgroundColor: isDark ? '#0d1117' : '#ffffff' }}>
      <ReactFlow
        nodes={rfNodes}
        edges={rfEdges}
        onNodesChange={onRfNodesChange}
        onEdgesChange={onRfEdgesChange}
        onNodeClick={onNodeClick}
        fitView
        minZoom={0.1}
        maxZoom={2}
      >
        <Controls />
        <MiniMap
          nodeColor={(n) => {
            if (n.style?.backgroundColor) return n.style.backgroundColor as string
            return '#6b7280'
          }}
          maskColor={isDark ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.7)'}
        />
        <Background color={isDark ? '#1c2128' : '#e5e7eb'} gap={16} />
      </ReactFlow>
    </div>
  )
}
