import { useCallback, useRef, useEffect } from 'react'
import { encodeToUrl, decodeFromUrl } from '../lib/url-codec'

export function useUrlState() {
  const initialized = useRef(false)

  const readFromUrl = useCallback((): unknown | null => {
    const hash = window.location.hash
    if (!hash.startsWith('#json=')) return null
    const compressed = hash.replace('#json=', '')
    return decodeFromUrl(compressed)
  }, [])

  const writeToUrl = useCallback((data: unknown) => {
    const compressed = encodeToUrl(data)
    if (!compressed) return
    const newHash = `#json=${compressed}`
    if (window.location.hash !== newHash) {
      window.history.replaceState(null, '', newHash)
    }
  }, [])

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true
  }, [])

  return { readFromUrl, writeToUrl }
}
