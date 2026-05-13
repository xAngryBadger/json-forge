export interface FlatNode {
  id: string
  key: string | number
  value: unknown
  type: 'object' | 'array' | 'string' | 'number' | 'boolean' | 'null'
  depth: number
  path: (string | number)[]
  pathString: string
  childCount: number
  collapsed: boolean
  lineNumber: number
  parentId: string | null
  hasChildren: boolean
}

export interface ParseResult {
  data: unknown
  error: string | null
  errorLine: number | null
  errorCol: number | null
}

export interface DiffInput {
  left: string
  right: string
}

export interface Stats {
  nodeCount: number
  maxDepth: number
  sizeBytes: number
}

export type ViewMode = 'tree' | 'graph' | 'diff' | 'raw'

export type ThemeMode = 'light' | 'dark'

export type IndentSize = 2 | 4

export interface GraphNode {
  id: string
  type: 'object' | 'array' | 'primitive'
  data: { label: string; jsonPath: string; value?: unknown }
  position: { x: number; y: number }
}

export interface GraphEdge {
  id: string
  source: string
  target: string
  label: string
}

export interface ToastMessage {
  id: string
  text: string
  visible: boolean
}
