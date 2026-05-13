import { useState, useCallback, useEffect, useRef } from 'react'

interface SplitPaneProps {
  children: [React.ReactNode, React.ReactNode]
  defaultSplit?: number
  minSize?: number
}

export function SplitPane({ children, defaultSplit = 40, minSize = 200 }: SplitPaneProps) {
  const [split, setSplit] = useState(defaultSplit)
  const containerRef = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)

  const onMouseDown = useCallback(() => {
    dragging.current = true
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }, [])

  const onMouseMove = useCallback((e: MouseEvent) => {
    if (!dragging.current || !containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const pct = ((e.clientX - rect.left) / rect.width) * 100
    const minPct = (minSize / rect.width) * 100
    const maxPct = 100 - minPct
    setSplit(Math.min(maxPct, Math.max(minPct, pct)))
  }, [minSize])

  const onMouseUp = useCallback(() => {
    dragging.current = false
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
  }, [])

  useEffect(() => {
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [onMouseMove, onMouseUp])

  return (
    <div ref={containerRef} className="flex h-full w-full overflow-hidden">
      <div style={{ width: `${split}%` }} className="overflow-hidden flex-shrink-0">
        {children[0]}
      </div>
      <div
        className="w-1 cursor-col-resize flex-shrink-0 hover:bg-[var(--color-accent)] active:bg-[var(--color-accent)] transition-colors"
        style={{ backgroundColor: 'var(--color-border)' }}
        onMouseDown={onMouseDown}
      />
      <div style={{ width: `${100 - split}%` }} className="overflow-hidden flex-grow">
        {children[1]}
      </div>
    </div>
  )
}
