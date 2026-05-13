import type { IndentSize } from '../types'
import type { FlatNode } from '../types'

export function inferType(data: unknown, rootName: string = 'Root'): string {
  const seen = new Map<string, string>()

  function typeName(value: unknown): string {
    if (value === null) return 'null'
    if (Array.isArray(value)) return 'array'
    return typeof value
  }

  function primitiveTsType(value: unknown): string {
    if (value === null) return 'null'
    if (typeof value === 'string') return 'string'
    if (typeof value === 'number') return 'number'
    if (typeof value === 'boolean') return 'boolean'
    return 'unknown'
  }

  function generateInterface(obj: Record<string, unknown>, name: string): string {
    if (seen.has(name)) return ''
    seen.set(name, name)

    const keys = Object.keys(obj)
    const optionalKeys = new Set<string>()
    const keyTypes = new Map<string, Set<string>>()

    for (const key of keys) {
      const val = obj[key]
      if (!keyTypes.has(key)) keyTypes.set(key, new Set())
      keyTypes.get(key)!.add(typeName(val))
    }

    const lines: string[] = []
    lines.push(`interface ${name} {`)

    for (const key of keys) {
      const val = obj[key]
      const tsType = getValueType(val, name + '_' + capitalize(key))
      const optional = optionalKeys.has(key) ? '?' : ''
      const safeKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) ? key : `'${key}'`
      lines.push(`  ${safeKey}${optional}: ${tsType};`)
    }

    lines.push('}')
    return lines.join('\n')
  }

  function getValueType(value: unknown, nameHint: string): string {
    if (value === null) return 'null'
    if (typeof value === 'string') return 'string'
    if (typeof value === 'number') return 'number'
    if (typeof value === 'boolean') return 'boolean'

    if (Array.isArray(value)) {
      if (value.length === 0) return 'unknown[]'
      const itemTypes = value.map((item) => getValueType(item, nameHint + 'Item'))
      const uniqueTypes = [...new Set(itemTypes)]

      if (uniqueTypes.length === 1) {
        const single = uniqueTypes[0]
        if (single.endsWith('[]') || single.includes('|')) return `(${single})[]`
        if (single.match(/^[A-Z]/)) return `${single}[]`
        return `${single}[]`
      }

      return `(${uniqueTypes.join(' | ')})[]`
    }

    if (typeof value === 'object' && value !== null) {
      const obj = value as Record<string, unknown>
      const iface = generateInterface(obj, nameHint)
      if (iface && !seen.has(nameHint)) {
        pendingInterfaces.push(iface)
      }
      return nameHint
    }

    return 'unknown'
  }

  const pendingInterfaces: string[] = []

  if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
    const obj = data as Record<string, unknown>
    pendingInterfaces.push(generateInterface(obj, rootName))
  } else if (Array.isArray(data)) {
    const itemType = data.length > 0 ? getValueType(data[0], rootName + 'Item') : 'unknown'
    pendingInterfaces.push(`type ${rootName} = ${itemType}[];\n`)
  } else {
    pendingInterfaces.push(`type ${rootName} = ${primitiveTsType(data)};\n`)
  }

  const uniqueInterfaces = [...new Set(pendingInterfaces.filter(Boolean))]
  return uniqueInterfaces.join('\n\n') + '\n'
}

function capitalize(s: string): string {
  if (!s) return s
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export function countNodes(data: unknown): number {
  if (data === null || data === undefined) return 1
  if (typeof data !== 'object') return 1
  if (Array.isArray(data)) {
    return 1 + data.reduce((sum: number, item: unknown) => sum + countNodes(item), 0)
  }
  const obj = data as Record<string, unknown>
  return 1 + Object.values(obj).reduce((sum: number, val: unknown) => sum + countNodes(val), 0)
}

export function maxDepth(data: unknown, current: number = 0): number {
  if (data === null || data === undefined) return current
  if (typeof data !== 'object') return current
  if (Array.isArray(data)) {
    if (data.length === 0) return current + 1
    return Math.max(...data.map((item: unknown) => maxDepth(item, current + 1)))
  }
  const obj = data as Record<string, unknown>
  const values = Object.values(obj)
  if (values.length === 0) return current + 1
  return Math.max(...values.map((val: unknown) => maxDepth(val, current + 1)))
}

export { formatJson, minifyJson } from './format'
export type { IndentSize, FlatNode }
