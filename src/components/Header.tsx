import { useState, useEffect } from 'react'
import { ThemeToggle } from './ThemeToggle'
import type { Settings, Theme } from '../types'

interface Props {
  settings: Settings
  theme: Theme
  setTheme: (t: Theme) => void
  viewMode: 'grid' | 'list'
  onToggleViewMode: (mode: 'grid' | 'list') => void
  onOpenPalette: () => void
  totalServices: number
}

export function Header({
  settings,
  theme,
  setTheme,
  viewMode,
  onToggleViewMode,
  onOpenPalette,
  totalServices,
}: Props) {
  const [time, setTime] = useState('')

  useEffect(() => {
    const tick = () =>
      setTime(
        new Date().toLocaleTimeString(undefined, {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      )
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <header
      style={{
        height: 52,
        borderBottom: '1px solid var(--border)',
        background: 'var(--header-bg)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 20px',
        gap: 16,
        flexShrink: 0,
        zIndex: 20,
        transition: 'background-color 0.2s ease, border-color 0.2s ease',
      }}
    >
      {/* Brand & Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 7,
            background: 'linear-gradient(135deg, #6366f1 0%, #3b82f6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 700,
            fontSize: 13,
            boxShadow: '0 0 12px rgba(99,102,241,0.3)',
          }}
        >
          H
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontWeight: 700, fontSize: 13.5, color: 'var(--text)', letterSpacing: '-0.01em' }}>
              {settings.title}
            </span>
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: '#10b981',
                boxShadow: '0 0 6px #10b981',
              }}
              title="Dashboard Ready"
            />
          </div>
          <span style={{ fontSize: 10.5, color: 'var(--dim)' }}>
            {settings.subtitle} · {totalServices} services
          </span>
        </div>
      </div>

      {/* Command Palette Trigger Button (interactive search) */}
      <button
        onClick={onOpenPalette}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          background: 'var(--card-bg)',
          border: '1px solid var(--border)',
          borderRadius: 8,
          padding: '6px 12px',
          color: 'var(--dim)',
          cursor: 'pointer',
          transition: 'all 0.15s',
          marginLeft: 16,
          width: 'clamp(180px, 25vw, 320px)',
          textAlign: 'left',
        }}
        onMouseEnter={e => {
          const el = e.currentTarget
          el.style.background = 'var(--card-hover)'
          el.style.borderColor = 'var(--border-h)'
          el.style.color = 'var(--text)'
        }}
        onMouseLeave={e => {
          const el = e.currentTarget
          el.style.background = 'var(--card-bg)'
          el.style.borderColor = 'var(--border)'
          el.style.color = 'var(--dim)'
        }}
      >
        <svg width={13} height={13} viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
            clipRule="evenodd"
          />
        </svg>
        <span style={{ fontSize: 12, flex: 1 }}>Search or jump to service...</span>
        <kbd
          style={{
            fontSize: 10,
            color: 'var(--dim)',
            background: 'var(--kbd-bg)',
            border: '1px solid var(--kbd-border)',
            borderRadius: 4,
            padding: '2px 5px',
            fontFamily: 'monospace',
          }}
        >
          ⌘K
        </kbd>
      </button>

      <div style={{ flex: 1 }} />

      {/* View Mode Switcher (Grid vs List) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          background: 'var(--card-bg)',
          border: '1px solid var(--border)',
          borderRadius: 8,
          padding: 2,
        }}
      >
        <button
          onClick={() => onToggleViewMode('grid')}
          title="Grid / Tiles View"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '4px 8px',
            borderRadius: 6,
            border: 'none',
            background: viewMode === 'grid' ? 'var(--active-pill)' : 'transparent',
            color: viewMode === 'grid' ? 'var(--text)' : 'var(--dim)',
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
          </svg>
        </button>
        <button
          onClick={() => onToggleViewMode('list')}
          title="List View"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '4px 8px',
            borderRadius: 6,
            border: 'none',
            background: viewMode === 'list' ? 'var(--active-pill)' : 'transparent',
            color: viewMode === 'list' ? 'var(--text)' : 'var(--dim)',
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="8" y1="6" x2="21" y2="6" />
            <line x1="8" y1="12" x2="21" y2="12" />
            <line x1="8" y1="18" x2="21" y2="18" />
            <line x1="3" y1="6" x2="3.01" y2="6" />
            <line x1="3" y1="12" x2="3.01" y2="12" />
            <line x1="3" y1="18" x2="3.01" y2="18" />
          </svg>
        </button>
      </div>

      {/* Live Clock */}
      <span
        style={{
          fontFamily: 'monospace',
          fontSize: 12.5,
          color: 'var(--mid)',
          fontVariantNumeric: 'tabular-nums',
          letterSpacing: '0.02em',
        }}
      >
        {time}
      </span>

      <ThemeToggle theme={theme} setTheme={setTheme} />
    </header>
  )
}
