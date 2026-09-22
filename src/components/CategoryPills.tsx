interface Props {
  categories: string[]
  activeCategory: string | null // null = 'all', 'favorites' = only favorites, or category name
  onSelect: (cat: string | null) => void
  totalCount: number
  favoritesCount: number
  countsByCategory: Record<string, number>
}

export function CategoryPills({
  categories,
  activeCategory,
  onSelect,
  totalCount,
  favoritesCount,
  countsByCategory,
}: Props) {
  const tabs: Array<{ id: string | null; label: string; count: number; icon?: string }> = [
    { id: null, label: 'All', count: totalCount },
    ...(favoritesCount > 0
      ? [{ id: '__favorites__', label: 'Favorites', count: favoritesCount, icon: '★' }]
      : []),
    ...categories.map(cat => ({
      id: cat,
      label: cat,
      count: countsByCategory[cat] ?? 0,
    })),
  ]

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        overflowX: 'auto',
        padding: '4px 0 8px',
        scrollbarWidth: 'none',
        flexShrink: 0,
      }}
    >
      {tabs.map(tab => {
        const isActive = activeCategory === tab.id
        return (
          <button
            key={tab.label}
            onClick={() => onSelect(tab.id)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 12px',
              borderRadius: 20,
              fontSize: 12,
              fontWeight: isActive ? 600 : 500,
              cursor: 'pointer',
              border: `1px solid ${isActive ? 'var(--border-h)' : 'var(--border)'}`,
              background: isActive
                ? 'var(--active-pill)'
                : 'var(--card-bg)',
              color: isActive ? 'var(--active-pill-text)' : 'var(--mid)',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease',
              boxShadow: isActive ? '0 2px 8px var(--shadow-color)' : 'none',
            }}
            onMouseEnter={e => {
              if (!isActive) {
                const el = e.currentTarget
                el.style.background = 'var(--card-hover)'
                el.style.color = 'var(--text)'
                el.style.borderColor = 'var(--border-h)'
              }
            }}
            onMouseLeave={e => {
              if (!isActive) {
                const el = e.currentTarget
                el.style.background = 'var(--card-bg)'
                el.style.color = 'var(--mid)'
                el.style.borderColor = 'var(--border)'
              }
            }}
          >
            {tab.icon && <span style={{ color: '#f59e0b', fontSize: 11 }}>{tab.icon}</span>}
            <span>{tab.label}</span>
            <span
              style={{
                fontSize: 10,
                opacity: isActive ? 1 : 0.7,
                padding: '1px 5px',
                borderRadius: 10,
                background: 'var(--kbd-bg)',
                border: '1px solid var(--kbd-border)',
              }}
            >
              {tab.count}
            </span>
          </button>
        )
      })}
    </div>
  )
}
