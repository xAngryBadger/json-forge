import type { ParseResult } from '../types'

function findErrorPosition(text: string): { line: number; col: number } | null {
  const match = text.match(/position\s+(\d+)/i)
  if (!match) return null
  const pos = parseInt(match[1], 10)
  let line = 1
  let col = 1
  for (let i = 0; i < pos && i < text.length; i++) {
    if (text[i] === '\n') {
      line++
      col = 1
    } else {
      col++
    }
  }
  return { line, col }
}

export function parseJson(input: string): ParseResult {
  if (!input.trim()) {
    return { data: null, error: null, errorLine: null, errorCol: null }
  }
  try {
    const data = JSON.parse(input)
    return { data, error: null, errorLine: null, errorCol: null }
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    const pos = findErrorPosition(message)
    return {
      data: null,
      error: message,
      errorLine: pos?.line ?? null,
      errorCol: pos?.col ?? null,
    }
  }
}
