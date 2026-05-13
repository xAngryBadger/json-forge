import { useState, useMemo } from 'react'
import { detailedDiff } from 'deep-object-diff'

export interface DiffResult {
  added: Record<string, unknown>
  deleted: Record<string, unknown>
  updated: Record<string, { oldVal: unknown; newVal: unknown }>
  hasChanges: boolean
}

export function useDiff(leftStr: string, rightStr: string) {
  const [leftInput, setLeftInput] = useState(leftStr)
  const [rightInput, setRightInput] = useState(rightStr)

  const diffResult = useMemo<DiffResult>(() => {
    try {
      const left = JSON.parse(leftInput)
      const right = JSON.parse(rightInput)
      const diff = detailedDiff(left, right) as {
        added: Record<string, unknown>
        deleted: Record<string, unknown>
        updated: Record<string, unknown>
      }
      return {
        added: diff.added,
        deleted: diff.deleted,
        updated: diff.updated as Record<string, { oldVal: unknown; newVal: unknown }>,
        hasChanges:
          Object.keys(diff.added).length > 0 ||
          Object.keys(diff.deleted).length > 0 ||
          Object.keys(diff.updated).length > 0,
      }
    } catch {
      return { added: {}, deleted: {}, updated: {}, hasChanges: false }
    }
  }, [leftInput, rightInput])

  const isValidLeft = useMemo(() => {
    try {
      JSON.parse(leftInput)
      return true
    } catch {
      return false
    }
  }, [leftInput])

  const isValidRight = useMemo(() => {
    try {
      JSON.parse(rightInput)
      return true
    } catch {
      return false
    }
  }, [rightInput])

  return {
    leftInput,
    rightInput,
    setLeftInput,
    setRightInput,
    diffResult,
    isValidLeft,
    isValidRight,
  }
}
