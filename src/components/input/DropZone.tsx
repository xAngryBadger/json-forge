import { useState, useCallback } from 'react'

interface DropZoneProps {
  onFileLoad: (content: string) => void
}

export function DropZone({ onFileLoad }: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)

      const files = e.dataTransfer.files
      if (files.length > 0) {
        const file = files[0]
        if (file.name.endsWith('.json') || file.type === 'application/json') {
          const reader = new FileReader()
          reader.onload = (ev) => {
            const text = ev.target?.result
            if (typeof text === 'string') onFileLoad(text)
          }
          reader.readAsText(file)
        }
      }
    },
    [onFileLoad],
  )

  if (!isDragging) return null

  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        border: '2px dashed var(--color-accent)',
        backdropFilter: 'blur(4px)',
      }}
    >
      <div className="text-center">
        <div className="text-4xl mb-2" style={{ color: 'var(--color-accent)' }}>⬇</div>
        <p className="text-sm font-medium" style={{ color: 'var(--color-accent)' }}>
          Drop JSON file here
        </p>
      </div>
    </div>
  )
}
