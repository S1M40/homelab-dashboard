import { useState, useEffect, useMemo, useCallback } from 'react'
import { Header } from './components/Header'
import { PinnedBar } from './components/PinnedBar'
import { CategoryPills } from './components/CategoryPills'
import { CategorySection } from './components/CategorySection'
import { CommandPalette } from './components/CommandPalette'
import { ShortcutsModal } from './components/ShortcutsModal'
import { ErrorBanner } from './components/ErrorBanner'
import { useConfig } from './hooks/useConfig'
import { useTheme } from './hooks/useTheme'
import { useFavorites } from './hooks/useFavorites'
import { useRecentlyVisited } from './hooks/useRecentlyVisited'
import { groupByCategory } from './hooks/useSearch'
import type { Theme } from './types'

const CAT_ORDER = ['Infrastructure', 'Monitoring', 'Media', 'Network', 'Development']
const VIEW_MODE_KEY = 'homelab-v2-view-mode'
const NEXT_THEME: Record<Theme, Theme> = { dark: 'light', light: 'system', system: 'dark' }

export function App() {
  const { config, loading, error } = useConfig()
  const { theme, setTheme } = useTheme()

  const [isPaletteOpen, setIsPaletteOpen] = useState(false)
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => {
    try {
      const v = localStorage.getItem(VIEW_MODE_KEY)
      if (v === 'list' || v === 'grid') return v
    } catch {
      // ignore
    }
    return 'grid'
  })

  const setViewModePersisted = useCallback((mode: 'grid' | 'list') => {
    setViewMode(mode)
    try {
      localStorage.setItem(VIEW_MODE_KEY, mode)
    } catch {
      // ignore
    }
  }, [])

  const configFavIds = useMemo(
    () => config.services.filter(s => s.favorite).map(s => s.id),
    [config.services]
  )
  const { isFavorite, toggleFavorite } = useFavorites(configFavIds)
  const { recentServices, trackVisit } = useRecentlyVisited(config.services)

  // Combined pinned services: starred favorites first, then recently visited (deduped)
  const pinnedServices = useMemo(() => {
    const favs = config.services.filter(s => isFavorite(s.id))
    const seen = new Set(favs.map(s => s.id))
    const recentsNotFav = recentServices.filter(s => !seen.has(s.id))
    return [...favs, ...recentsNotFav]
  }, [config.services, isFavorite, recentServices])

  // Group services
  const grouped = useMemo(() => groupByCategory(config.services), [config.services])

  // Ordered categories list
  const categories = useMemo(() => {
    return Array.from(grouped.keys()).sort((a, b) => {
      const ai = CAT_ORDER.indexOf(a),
        bi = CAT_ORDER.indexOf(b)
      return (ai < 0 ? 999 : ai) - (bi < 0 ? 999 : bi)
    })
  }, [grouped])

  // Counts map for pill tabs
  const countsByCategory = useMemo(() => {
    const map: Record<string, number> = {}
    for (const [cat, svcs] of grouped.entries()) {
      map[cat] = svcs.length
    }
    return map
  }, [grouped])

  const favoritesCount = useMemo(
    () => config.services.filter(s => isFavorite(s.id)).length,
    [config.services, isFavorite]
  )

  // Filtered by active tab
  const displayedSections = useMemo(() => {
    if (activeCategory === '__favorites__') {
      const favs = config.services.filter(s => isFavorite(s.id))
      return [{ category: 'Favorites', services: favs }]
    }
    if (activeCategory && grouped.has(activeCategory)) {
      return [{ category: activeCategory, services: grouped.get(activeCategory)! }]
    }
    // All
    return categories.map(cat => ({ category: cat, services: grouped.get(cat)! }))
  }, [activeCategory, grouped, categories, config.services, isFavorite])

  // Keyboard shortcut listeners
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null
      const isInput =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setIsPaletteOpen(prev => !prev)
        return
      }

      if (!isInput) {
        if (e.key === '/') {
          e.preventDefault()
          setIsPaletteOpen(true)
        } else if (e.key.toLowerCase() === 'g') {
          e.preventDefault()
          setViewModePersisted(viewMode === 'grid' ? 'list' : 'grid')
        } else if (e.key.toLowerCase() === 't') {
          e.preventDefault()
          setTheme(NEXT_THEME[theme])
        } else if (e.key === '?') {
          e.preventDefault()
          setIsShortcutsOpen(prev => !prev)
        } else if (e.key === 'Escape') {
          setIsPaletteOpen(false)
          setIsShortcutsOpen(false)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [viewMode, theme, setTheme, setViewModePersisted])

  if (loading) {
    return (
      <div
        style={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          background: 'var(--bg)',
        }}
      >
        <div
          style={{
            width: 24,
            height: 24,
            borderRadius: '50%',
            border: '2px solid rgba(255,255,255,0.1)',
            borderTopColor: '#6366f1',
            animation: 'spin 0.8s linear infinite',
          }}
        />
        <span style={{ color: 'var(--dim)', fontSize: 12, fontFamily: 'monospace' }}>
          initializing dashboard…
        </span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        background: 'var(--bg)',
        color: 'var(--text)',
      }}
    >
      {/* Top Header */}
      <Header
        settings={config.settings}
        theme={theme}
        setTheme={setTheme}
        viewMode={viewMode}
        onToggleViewMode={setViewModePersisted}
        onOpenPalette={() => setIsPaletteOpen(true)}
        totalServices={config.services.length}
      />

      {/* Pinned / Favorites Quick Strip */}
      <PinnedBar services={pinnedServices} onVisit={trackVisit} />

      {/* Main Body */}
      <main
        style={{
          flex: '1 1 0',
          minHeight: 0,
          overflowY: 'auto',
          padding: '20px 24px 32px',
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
        }}
      >
        {error && <ErrorBanner error={error} />}

        {/* Interactive Category Filter Pills */}
        <CategoryPills
          categories={categories}
          activeCategory={activeCategory}
          onSelect={setActiveCategory}
          totalCount={config.services.length}
          favoritesCount={favoritesCount}
          countsByCategory={countsByCategory}
        />

        {/* Empty state */}
        {!config.services.length && !error && (
          <div style={{ padding: '80px 0', textAlign: 'center', color: 'var(--dim)', fontSize: 12 }}>
            No services found. Edit{' '}
            <code style={{ fontFamily: 'monospace', color: 'var(--mid)' }}>config/services.json</code>
          </div>
        )}

        {/* Category Sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {displayedSections.map(sec => (
            <CategorySection
              key={sec.category}
              title={sec.category}
              services={sec.services}
              isFavorite={isFavorite}
              onToggleFavorite={toggleFavorite}
              onVisit={trackVisit}
              viewMode={viewMode}
            />
          ))}
        </div>
      </main>

      {/* Bottom status bar */}
      <footer
        style={{
          height: 30,
          borderTop: '1px solid var(--border)',
          background: 'var(--footer-bg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 20px',
          fontSize: 11,
          color: 'var(--dim)',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span>
            Press <kbd style={{ fontFamily: 'monospace', color: 'var(--mid)' }}>⌘K</kbd> to launch
          </span>
          <span>·</span>
          <span>
            <kbd style={{ fontFamily: 'monospace', color: 'var(--mid)' }}>G</kbd> view mode
          </span>
          <span>·</span>
          <button
            onClick={() => setIsShortcutsOpen(true)}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              color: 'var(--mid)',
              cursor: 'pointer',
              fontSize: 11,
              fontFamily: 'inherit',
            }}
          >
            <kbd style={{ fontFamily: 'monospace' }}>?</kbd> shortcuts
          </button>
        </div>

        <div>
          <span>{config.services.length} services loaded dynamically</span>
        </div>
      </footer>

      {/* Interactive Command Palette Modal */}
      {isPaletteOpen && (
        <CommandPalette
          services={config.services}
          onVisit={trackVisit}
          onClose={() => setIsPaletteOpen(false)}
        />
      )}

      {/* Interactive Shortcuts Modal */}
      {isShortcutsOpen && <ShortcutsModal onClose={() => setIsShortcutsOpen(false)} />}
    </div>
  )
}
