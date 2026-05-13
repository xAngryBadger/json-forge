import type { Stats } from '../../types'

interface StatsBarProps {
  stats: Stats | null
}

export function StatsBar({ stats }: StatsBarProps) {
  if (!stats) return null

  return (
    <div
      className="flex items-center gap-4 px-3 h-7 border-t text-[10px] font-mono"
      style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-alt)', color: 'var(--color-text-3)' }}
    >
      <span>{stats.nodeCount.toLocaleString()} nodes</span>
      <span>max depth {stats.maxDepth}</span>
      <span>{formatBytes(stats.sizeBytes)}</span>
    </div>
  )
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
