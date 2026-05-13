import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string'

export function encodeToUrl(data: unknown): string {
  const json = JSON.stringify(data)
  const compressed = compressToEncodedURIComponent(json)
  if (compressed.length > 100_000) return ''
  return compressed
}

export function decodeFromUrl(hash: string): unknown | null {
  if (!hash) return null
  try {
    const decompressed = decompressFromEncodedURIComponent(hash)
    if (!decompressed) return null
    return JSON.parse(decompressed)
  } catch {
    return null
  }
}
