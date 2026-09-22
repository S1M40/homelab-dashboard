import { useState } from 'react'
import type { Service } from '../types'
import { ServiceTile } from './ServiceTile'
import { ServiceListRow } from './ServiceListRow'

interface Props {
  title: string
  services: Service[]
  isFavorite: (id: string) => boolean
  onToggleFavorite: (id: string) => void
  onVisit: (id: string) => void
  viewMode: 'grid' | 'list'
  defaultCollapsed?: boolean
}

export function CategorySection({
  title,
  services,
  isFavorite,
  onToggleFavorite,
  onVisit,
  viewMode,
  defaultCollapsed = false,
}: Props) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed)

  if (!services.length) return null

  return (
    <div id={`cat-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      {/* Category header with collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'none',
          border: 'none',
          padding: '4px 0 10px',
          marginBottom: 10,
          borderBottom: '1px solid var(--border)',
          cursor: 'pointer',
          textAlign: 'left',
          color: 'inherit',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              fontSize: 10,
              color: 'var(--dim)',
              transform: collapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
              transition: 'transform 0.15s',
              display: 'inline-block',
            }}
          >
            ▼
          </span>
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.09em',
              color: 'var(--mid)',
            }}
          >
            {title}
          </span>
        </div>

        <span
          style={{
            fontSize: 11,
            color: 'var(--dim)',
            fontFamily: 'monospace',
          }}
        >
          {services.length}
        </span>
      </button>

      {/* Content */}
      {!collapsed && (
        <>
          {viewMode === 'grid' ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(115px, 1fr))',
                gap: 10,
              }}
            >
              {services.map((service, index) => (
                <ServiceTile
                  key={service.id}
                  service={service}
                  isFavorite={isFavorite(service.id)}
                  onToggleFavorite={onToggleFavorite}
                  onVisit={onVisit}
                  animDelay={Math.min(index * 25, 300)}
                />
              ))}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {services.map((service, index) => (
                <ServiceListRow
                  key={service.id}
                  service={service}
                  isFavorite={isFavorite(service.id)}
                  onToggleFavorite={onToggleFavorite}
                  onVisit={onVisit}
                  animDelay={Math.min(index * 20, 200)}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
