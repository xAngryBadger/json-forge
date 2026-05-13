import type { IndentSize } from '../types'

export function formatJson(data: unknown, indent: IndentSize = 2): string {
  return JSON.stringify(data, null, indent)
}

export function minifyJson(data: unknown): string {
  return JSON.stringify(data)
}

export function reformatString(input: string, indent: IndentSize = 2): string {
  const parsed = JSON.parse(input)
  return JSON.stringify(parsed, null, indent)
}

export function minifyString(input: string): string {
  const parsed = JSON.parse(input)
  return JSON.stringify(parsed)
}
