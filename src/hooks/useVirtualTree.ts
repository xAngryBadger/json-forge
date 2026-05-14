import { useState, useCallback, useMemo } from 'react'
import type { FlatNode } from '../types'

function getNodeType(value: unknown): FlatNode['type'] {
  if (value === null) return 'null'
  if (Array.isArray(value)) return 'array'
  if (typeof value === 'object') return 'object'
  if (typeof value === 'string') return 'string'
  if (typeof value === 'number') return 'number'
  if (typeof value === 'boolean') return 'boolean'
  return 'null'
}

function getChildCount(value: unknown): number {
  if (value === null) return 0
  if (Array.isArray(value)) return value.length
  if (typeof value === 'object') return Object.keys(value as Record<string, unknown>).length
  return 0
}

function pathToId(path: (string | number)[]): string {
  if (path.length === 0) return 'root'
  let r = 'root'
  for (const seg of path) {
    if (typeof seg === 'number') r += `[${seg}]`
    else if (/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(String(seg))) r += `.${seg}`
    else r += `['${seg}']`
  }
  return r
}

function flattenNode(
  value: unknown,
  key: string | number,
  depth: number,
  path: (string | number)[],
  collapsedSet: Set<string>,
  parentId: string | null,
  lineNum: { value: number },
  matchedPaths: Set<string>,
): FlatNode[] {
  const id = pathToId(path)
  const pathStr = path.length === 0 ? '$' : (() => {
    let r = '$'
    for (const seg of path) {
      if (typeof seg === 'number') r += `[${seg}]`
      else if (/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(String(seg))) r += `.${seg}`
      else r += `['${seg}']`
    }
    return r
  })()

  const type = getNodeType(value)
  const childCount = getChildCount(value)
  const hasChildren = type === 'object' || type === 'array'
  const collapsed = collapsedSet.has(id)
  const isMatched = matchedPaths.has(pathStr)

  const node: FlatNode & { matched?: boolean } = {
    id,
    key,
    value,
    type,
    depth,
    path,
    pathString: pathStr,
    childCount,
    collapsed,
    lineNumber: lineNum.value++,
    parentId,
    hasChildren,
    matched: isMatched,
  }

  const results: FlatNode[] = [node]

  if (hasChildren && !collapsed) {
    if (Array.isArray(value)) {
      for (let i = 0; i < value.length; i++) {
        results.push(
          ...flattenNode(
            value[i],
            i,
            depth + 1,
            [...path, i],
            collapsedSet,
            id,
            lineNum,
            matchedPaths,
          ),
        )
      }
    } else if (typeof value === 'object' && value !== null) {
      const obj = value as Record<string, unknown>
      for (const [objKey, objVal] of Object.entries(obj)) {
        results.push(
          ...flattenNode(
            objVal,
            objKey,
            depth + 1,
            [...path, objKey],
            collapsedSet,
            id,
            lineNum,
            matchedPaths,
          ),
        )
      }
    }
  }

  return results
}

export function useVirtualTree(data: unknown) {
  const [collapsedNodes, setCollapsedNodes] = useState<Set<string>>(new Set())
  const [matchedPaths, setMatchedPaths] = useState<Set<string>>(new Set())

  const flatNodes = useMemo(() => {
    const lineNum = { value: 1 }
    return flattenNode(data, '', 0, [], collapsedNodes, null, lineNum, matchedPaths)
  }, [data, collapsedNodes, matchedPaths])

  const toggleCollapse = useCallback((nodeId: string) => {
    setCollapsedNodes((prev) => {
      const next = new Set(prev)
      if (next.has(nodeId)) {
        next.delete(nodeId)
      } else {
        next.add(nodeId)
      }
      return next
    })
  }, [])

  const collapseAll = useCallback(() => {
    const allCollapsible = new Set<string>()
    for (const node of flatNodes) {
      if (node.hasChildren) allCollapsible.add(node.id)
    }
    setCollapsedNodes(allCollapsible)
  }, [flatNodes])

  const expandAll = useCallback(() => {
    setCollapsedNodes(new Set())
  }, [])

  return {
    flatNodes,
    toggleCollapse,
    collapseAll,
    expandAll,
    matchedPaths,
    setMatchedPaths,
  }
}
