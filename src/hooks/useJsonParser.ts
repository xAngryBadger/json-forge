import { useState, useCallback, useRef, useEffect } from 'react'
import { parseJson } from '../lib/parser'
import type { ParseResult } from '../types'

const LARGE_FILE_THRESHOLD = 1_000_000

export function useJsonParser(delay: number = 150) {
  const [input, setInput] = useState('')
  const [result, setResult] = useState<ParseResult>({
    data: null,
    error: null,
    errorLine: null,
    errorCol: null,
  })
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const workerRef = useRef<Worker | null>(null)

  useEffect(() => {
    try {
      workerRef.current = new Worker(
        new URL('../lib/json-worker.ts', import.meta.url),
        { type: 'module' },
      )
      workerRef.current.onmessage = (e: MessageEvent) => {
        if (e.data.success) {
          setResult({ data: e.data.data, error: null, errorLine: null, errorCol: null })
        } else {
          setResult({ data: null, error: e.data.error, errorLine: null, errorCol: null })
        }
      }
    } catch {
      workerRef.current = null
    }

    return () => {
      workerRef.current?.terminate()
    }
  }, [])

  const parse = useCallback(
    (text: string) => {
      if (timerRef.current) clearTimeout(timerRef.current)

      if (text.length > LARGE_FILE_THRESHOLD && workerRef.current) {
        workerRef.current.postMessage({ input: text })
        return
      }

      timerRef.current = setTimeout(() => {
        setResult(parseJson(text))
      }, delay)
    },
    [delay],
  )

  const setInputAndParse = useCallback(
    (text: string) => {
      setInput(text)
      parse(text)
    },
    [parse],
  )

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  return { input, result, setInput: setInputAndParse, parseImmediately: (text: string) => setResult(parseJson(text)) }
}
