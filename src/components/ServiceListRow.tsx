import { useState, useEffect, useCallback } from 'react'
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

function RowIcon({ service }: { service: Service }) {
  const [svg, setSvg] = useState<string | null>(null)
  const [ready, setReady] = useState(false)
  useEffect(() => {
    let dead = false
    getIconSvg(service.icon).then(s => {
      if (!dead) {
        setSvg(s)
        setReady(true)
      }
    })
    return () => {
      dead = true
    }
  }, [service.icon])
  const color = service.color ?? '#8080c0'
  if (!ready) return <div style={{ width: 22, height: 22 }} />
  return (
    <div
      style={{ width: 22, height: 22, color, flexShrink: 0 }}
      className="[&_svg]:h-full [&_svg]:w-full [&_svg]:fill-current"
      dangerouslySetInnerHTML={{ __html: svg ?? getFallbackSvg(service.name, color) }}
    />
  )
}

interface Props {
  service: Service
  isFavorite: boolean
  onToggleFavorite: (id: string) => void
  onVisit: (id: string) => void
  animDelay?: number
}

export function ServiceListRow({ service, isFavorite, onToggleFavorite, onVisit, animDelay = 0 }: Props) {
  const [hovered, setHovered] = useState(false)
  const [copied, setCopied] = useState(false)
  const color = service.color ?? '#6060a0'

  const handleFav = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onToggleFavorite(service.id)
  }, [service.id, onToggleFavorite])

  const handleCopy = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    navigator.clipboard.writeText(service.url)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }, [service.url])

  return (
    <div
      className="tile-enter"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        animationDelay: `${animDelay}ms`,
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '10px 14px',
        background: hovered ? hex2rgba(color, 0.12) : 'var(--card-bg)',
        border: `1px solid ${hovered ? hex2rgba(color, 0.3) : 'var(--border)'}`,
        borderLeft: `3px solid ${hovered ? color : hex2rgba(color, 0.4)}`,
        borderRadius: 8,
        transition: 'all 0.15s ease',
      }}
    >
      <RowIcon service={service} />

      {/* Name + Description */}
      <div style={{ flex: '1 1 200px', minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <a
            href={service.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => onVisit(service.id)}
            style={{
              fontWeight: 600,
              fontSize: 13,
              color: 'var(--text)',
              textDecoration: 'none',
            }}
          >
            {service.name}
          </a>
          {isFavorite && (
            <span style={{ color: '#f59e0b', fontSize: 12 }} title="Favorite">★</span>
          )}
        </div>
        <div style={{
          fontSize: 11,
          color: 'var(--dim)',
          marginTop: 2,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {service.description}
        </div>
      </div>

      {/* Category badge */}
      <span style={{
        fontSize: 10.5,
        color: 'var(--mid)',
        background: 'var(--card-bg)',
        border: '1px solid var(--border)',
        borderRadius: 5,
        padding: '3px 8px',
        flexShrink: 0,
      }}>
        {service.category}
      </span>

      {/* URL */}
      <div style={{
        fontSize: 11,
        fontFamily: 'monospace',
        color: 'var(--mid)',
        maxWidth: 220,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }}>
        {service.url}
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
        <button
          onClick={handleCopy}
          title={copied ? 'Copied URL!' : 'Copy URL'}
          style={{
            background: 'none',
            border: 'none',
            padding: '4px 6px',
            borderRadius: 4,
            cursor: 'pointer',
            color: copied ? '#10b981' : 'var(--dim)',
            fontSize: 11,
            transition: 'color 0.15s',
          }}
        >
          {copied ? '✓' : 'Copy'}
        </button>

        <button
          onClick={handleFav}
          title={isFavorite ? 'Remove favorite' : 'Star favorite'}
          style={{
            background: 'none',
            border: 'none',
            padding: 4,
            cursor: 'pointer',
            color: isFavorite ? '#f59e0b' : 'var(--dim)',
            display: 'flex',
          }}
        >
          <svg width={13} height={13} viewBox="0 0 20 20"
            fill={isFavorite ? 'currentColor' : 'none'}
            stroke="currentColor" strokeWidth={isFavorite ? 0 : 1.5}>
            <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" clipRule="evenodd" />
          </svg>
        </button>

        <a
          href={service.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => onVisit(service.id)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '4px 8px',
            fontSize: 11,
            fontWeight: 500,
            borderRadius: 5,
            background: hovered ? hex2rgba(color, 0.25) : 'var(--card-bg)',
            color: hovered ? '#fff' : 'var(--text)',
            border: `1px solid ${hovered ? hex2rgba(color, 0.4) : 'var(--border)'}`,
            textDecoration: 'none',
            transition: 'all 0.15s',
          }}
        >
          Open ↗
        </a>
      </div>
    </div>
  )
}
