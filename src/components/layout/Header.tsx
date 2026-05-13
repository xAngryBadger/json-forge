import type { ViewMode, ThemeMode } from '../../types'

interface HeaderProps {
  theme: ThemeMode
  onThemeToggle: () => void
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
}

export function Header({ theme, onThemeToggle, viewMode, onViewModeChange }: HeaderProps) {
  const modes: { key: ViewMode; label: string; icon: string }[] = [
    { key: 'tree', label: 'Tree', icon: '⊤' },
    { key: 'graph', label: 'Graph', icon: '◈' },
    { key: 'diff', label: 'Diff', icon: '⇔' },
    { key: 'raw', label: 'Raw', icon: '{ }' },
  ]

  return (
    <header className="flex items-center justify-between px-4 h-12 border-b" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-alt)' }}>
      <div className="flex items-center gap-4">
        <h1 className="text-base font-bold flex items-center gap-2" style={{ color: 'var(--color-accent)' }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 5C3 3.89543 3.89543 3 5 3H15C16.1046 3 17 3.89543 17 5V15C17 16.1046 16.1046 17 15 17H5C3.89543 17 3 16.1046 3 15V5Z" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M7 7H13M7 10H13M7 13H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          JSON Forge
        </h1>
        <nav className="flex gap-1">
          {modes.map((m) => (
            <button
              key={m.key}
              onClick={() => onViewModeChange(m.key)}
              className="px-3 py-1 text-xs font-medium rounded-md transition-colors"
              style={{
                backgroundColor: viewMode === m.key ? 'var(--color-accent)' : 'transparent',
                color: viewMode === m.key ? '#fff' : 'var(--color-text-2)',
              }}
            >
              <span className="mr-1">{m.icon}</span>
              {m.label}
            </button>
          ))}
        </nav>
      </div>
      <button
        onClick={onThemeToggle}
        className="p-2 rounded-md text-sm transition-colors hover:bg-[var(--color-bg-surface)]"
        style={{ color: 'var(--color-text-2)' }}
        title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
      >
        {theme === 'dark' ? '☀' : '☾'}
      </button>
    </header>
  )
}
