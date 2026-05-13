import { useState, useCallback } from 'react'
import { buildJsonPath } from '../lib/path-builder'

export function useJsonPath() {
  const [selectedPath, setSelectedPath] = useState<(string | number)[]>([])
  const [pathString, setPathString] = useState('$')

  const selectNode = useCallback((path: (string | number)[]) => {
    setSelectedPath(path)
    setPathString(buildJsonPath(path))
  }, [])

  const clearSelection = useCallback(() => {
    setSelectedPath([])
    setPathString('$')
  }, [])

  return { selectedPath, pathString, selectNode, clearSelection }
}
