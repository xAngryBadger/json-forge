import yaml from 'js-yaml'
import type { IndentSize } from '../types'

export function jsonToCsv(data: unknown): string {
  if (!Array.isArray(data)) {
    if (typeof data === 'object' && data !== null) {
      const obj = data as Record<string, unknown>
      const arrays = Object.entries(obj).filter(([, v]) => Array.isArray(v))
      if (arrays.length > 0) {
        const [, arr] = arrays[0]
        return jsonToCsv(arr)
      }
      return jsonToCsv([data])
    }
    throw new Error('Cannot convert non-array to CSV')
  }

  if (data.length === 0) return ''

  const allKeys = new Set<string>()
  for (const item of data) {
    if (typeof item === 'object' && item !== null && !Array.isArray(item)) {
      Object.keys(item as Record<string, unknown>).forEach((k) => allKeys.add(k))
    }
  }

  const keys = [...allKeys]
  const lines: string[] = [keys.map(escapeCsv).join(',')]

  for (const item of data) {
    if (typeof item === 'object' && item !== null && !Array.isArray(item)) {
      const obj = item as Record<string, unknown>
      const values = keys.map((k) => {
        const val = obj[k]
        if (val === undefined || val === null) return ''
        if (typeof val === 'object') return escapeCsv(JSON.stringify(val))
        return escapeCsv(String(val))
      })
      lines.push(values.join(','))
    } else {
      lines.push(escapeCsv(String(item)))
    }
  }

  return lines.join('\n')
}

function escapeCsv(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

export function jsonToYaml(data: unknown): string {
  return yaml.dump(data, { indent: 2, lineWidth: 120, noRefs: true })
}

export function inferJsonSchema(data: unknown): string {
  function inferSchema(value: unknown): Record<string, unknown> {
    if (value === null) return { type: 'null' }
    if (typeof value === 'string') return { type: 'string' }
    if (typeof value === 'number') {
      return Number.isInteger(value as number)
        ? { type: 'integer' }
        : { type: 'number' }
    }
    if (typeof value === 'boolean') return { type: 'boolean' }

    if (Array.isArray(value)) {
      if (value.length === 0) return { type: 'array', items: {} }
      const itemSchemas = value.map(inferSchema)
      const types = new Set(itemSchemas.map((s) => s.type))
      if (types.size === 1) {
        return { type: 'array', items: itemSchemas[0] }
      }
      return { type: 'array', items: { oneOf: itemSchemas } }
    }

    if (typeof value === 'object' && value !== null) {
      const obj = value as Record<string, unknown>
      const properties: Record<string, unknown> = {}
      const required: string[] = []

      for (const [key, val] of Object.entries(obj)) {
        properties[key] = inferSchema(val)
        required.push(key)
      }

      return {
        type: 'object',
        properties,
        required,
      }
    }

    return {}
  }

  const schema = inferSchema(data)
  return JSON.stringify({ $schema: 'http://json-schema.org/draft-07/schema#', ...schema }, null, 2)
}

export function exportJson(data: unknown, indent: IndentSize = 2): string {
  return JSON.stringify(data, null, indent)
}
