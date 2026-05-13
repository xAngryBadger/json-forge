interface PathBreadcrumbProps {
  pathString: string
  onClear: () => void
}

export function PathBreadcrumb({ pathString, onClear }: PathBreadcrumbProps) {
  return (
    <div
      className="sticky top-0 z-10 flex items-center gap-2 px-3 py-1.5 border-b text-xs font-mono"
      style={{
        backgroundColor: 'var(--color-bg-alt)',
        borderColor: 'var(--color-border)',
        color: 'var(--color-accent)',
      }}
    >
      <span className="opacity-50">Path:</span>
      <span className="truncate flex-1">{pathString}</span>
      {pathString !== '$' && (
        <button
          onClick={onClear}
          className="opacity-50 hover:opacity-100 transition-opacity text-xs"
          style={{ color: 'var(--color-text-3)' }}
        >
          ✕
        </button>
      )}
    </div>
  )
}
