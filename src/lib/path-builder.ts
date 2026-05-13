import type { FlatNode } from '../types'

export function buildJsonPath(path: (string | number)[]): string {
  if (path.length === 0) return '$'
  let result = '$'
  for (const segment of path) {
    if (typeof segment === 'number') {
      result += `[${segment}]`
    } else if (/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(segment)) {
      result += `.${segment}`
    } else {
      result += `['${segment}']`
    }
  }
  return result
}

export function buildPathFromNode(node: FlatNode): string {
  return node.pathString
}
