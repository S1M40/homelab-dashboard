import { useState, useEffect } from 'react'
import type { Service } from '../types'
import { getIconSvg, getFallbackSvg } from '../lib/icons'

function hex2rgba(hex: string, a: number) {
  const h = hex.replace('#', '')
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  if (isNaN(r) || isNaN(g) || isNaN(b)) return `rgba(80,80,120,${a})`
  return `rgba(${r},${g},${b},${a})`
}

function PinnedIcon({ service }: { service: Service }) {
  const [svg, setSvg] = useState<string | null>(null)
  useEffect(() => {
    let dead = false
    getIconSvg(service.icon).then(s => {
      if (!dead) setSvg(s)
    })
    return () => {
      dead = true
    }
  }, [service.icon])
  const color = service.color ?? '#8080c0'
  return (
    <div
      style={{ width: 16, height: 16, color, flexShrink: 0 }}
      className="[&_svg]:h-full [&_svg]:w-full [&_svg]:fill-current"
      dangerouslySetInnerHTML={{ __html: svg ?? getFallbackSvg(service.name, color) }}
    />
  )
}

interface Props {
  services: Service[] // favorites + recently visited
  onVisit: (id: string) => void
}

export function PinnedBar({ services, onVisit }: Props) {
  if (!services.length) return null

  return (
    <div
      style={{
        flexShrink: 0,
        height: 46,
        minHeight: 46,
        background: 'var(--header-bg)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 20px',
        zIndex: 10,
        position: 'relative',
        transition: 'background-color 0.2s ease, border-color 0.2s ease',
      }}
    >
      {/* Label Badge */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          paddingRight: 14,
          marginRight: 6,
          borderRight: '1px solid var(--border)',
          flexShrink: 0,
        }}
      >
        <span style={{ color: '#f59e0b', fontSize: 13, lineHeight: 1 }}>★</span>
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--mid)',
            userSelect: 'none',
          }}
        >
          Pinned
        </span>
        <span
          style={{
            fontSize: 10,
            color: 'var(--dim)',
            padding: '1px 5px',
            borderRadius: 8,
            background: 'var(--kbd-bg)',
            border: '1px solid var(--kbd-border)',
            fontFamily: 'monospace',
          }}
        >
          {services.length}
        </span>
      </div>

      {/* Scrollable list of pinned items */}
      <div
        className="pinned-scroll"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          overflowX: 'auto',
          scrollbarWidth: 'none',
          flex: 1,
          padding: '2px 0',
        }}
      >
        {services.map(s => {
          const color = s.color ?? '#6060a0'
          return (
            <a
              key={s.id}
              href={s.url || '#'}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => onVisit(s.id)}
              title={`${s.name} — ${s.description}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                padding: '4px 10px',
                height: 28,
                background: 'var(--card-bg)',
                border: '1px solid var(--border)',
                borderLeft: `3px solid ${color}`,
                borderRadius: 6,
                flexShrink: 0,
                cursor: 'pointer',
                textDecoration: 'none',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget
                el.style.background = 'var(--card-hover)'
                el.style.borderColor = hex2rgba(color, 0.4)
                el.style.borderLeftColor = color
                el.style.boxShadow = `0 2px 8px ${hex2rgba(color, 0.25)}`
                el.style.transform = 'translateY(-1px)'
              }}
              onMouseLeave={e => {
                const el = e.currentTarget
                el.style.background = 'var(--card-bg)'
                el.style.borderColor = 'var(--border)'
                el.style.borderLeftColor = color
                el.style.boxShadow = 'none'
                el.style.transform = 'translateY(0)'
              }}
            >
              <PinnedIcon service={s} />
              <span
                style={{
                  fontSize: 11.5,
                  fontWeight: 500,
                  color: 'var(--text)',
                  whiteSpace: 'nowrap',
                }}
              >
                {s.name}
              </span>
            </a>
          )
        })}
      </div>
    </div>
  )
}
