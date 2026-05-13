import { useState, useCallback } from 'react'

interface UrlFetcherProps {
  onResponse: (json: string, status: number, latency: number) => void
}

export function UrlFetcher({ onResponse }: UrlFetcherProps) {
  const [url, setUrl] = useState('')
  const [method, setMethod] = useState('GET')
  const [body, setBody] = useState('')
  const [loading, setLoading] = useState(false)
  const [headers, setHeaders] = useState<Record<string, string>>({})
  const [showHeaders, setShowHeaders] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFetch = useCallback(async () => {
    if (!url.trim()) return
    setLoading(true)
    setError(null)
    const start = performance.now()
    try {
      const opts: RequestInit = { method }
      if (method !== 'GET' && method !== 'HEAD' && body.trim()) {
        opts.body = body
        opts.headers = { 'Content-Type': 'application/json' }
      }
      const res = await fetch(url, opts)
      const elapsed = Math.round(performance.now() - start)
      const text = await res.text()
      const responseHeaders: Record<string, string> = {}
      res.headers.forEach((value, key) => {
        responseHeaders[key] = value
      })
      setHeaders(responseHeaders)
      try {
        const formatted = JSON.stringify(JSON.parse(text), null, 2)
        onResponse(formatted, res.status, elapsed)
      } catch {
        onResponse(text, res.status, elapsed)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Fetch failed')
    } finally {
      setLoading(false)
    }
  }, [url, method, body, onResponse])

  return (
    <div className="p-3 space-y-2" style={{ backgroundColor: 'var(--color-bg-alt)', borderBottom: '1px solid var(--color-border)' }}>
      <div className="flex gap-2">
        <select
          value={method}
          onChange={(e) => setMethod(e.target.value)}
          className="px-2 py-1.5 rounded text-xs font-mono"
          style={{
            backgroundColor: 'var(--color-bg-surface)',
            color: 'var(--color-text)',
            border: '1px solid var(--color-border)',
          }}
        >
          {['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://api.example.com/data"
          className="flex-1 px-3 py-1.5 rounded text-xs font-mono"
          style={{
            backgroundColor: 'var(--color-bg-surface)',
            color: 'var(--color-text)',
            border: '1px solid var(--color-border)',
          }}
          onKeyDown={(e) => e.key === 'Enter' && handleFetch()}
        />
        <button
          onClick={handleFetch}
          disabled={loading}
          className="px-3 py-1.5 rounded text-xs font-medium transition-colors"
          style={{
            backgroundColor: 'var(--color-accent)',
            color: '#fff',
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? '...' : 'Send'}
        </button>
      </div>
      {method !== 'GET' && method !== 'HEAD' && (
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder='{"key": "value"}'
          className="w-full px-3 py-1.5 rounded text-xs font-mono h-16 resize-y"
          style={{
            backgroundColor: 'var(--color-bg-surface)',
            color: 'var(--color-text)',
            border: '1px solid var(--color-border)',
          }}
        />
      )}
      {error && (
        <p className="text-xs" style={{ color: 'var(--color-removed)' }}>{error}</p>
      )}
      {Object.keys(headers).length > 0 && (
        <div>
          <button
            onClick={() => setShowHeaders(!showHeaders)}
            className="text-xs font-medium"
            style={{ color: 'var(--color-text-3)' }}
          >
            {showHeaders ? 'Hide' : 'Show'} Response Headers
          </button>
          {showHeaders && (
            <div className="mt-1 text-xs font-mono space-y-0.5" style={{ color: 'var(--color-text-2)' }}>
              {Object.entries(headers).map(([key, val]) => (
                <div key={key}>
                  <span style={{ color: 'var(--color-key)' }}>{key}</span>: {val}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
