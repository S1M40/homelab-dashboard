import { useState, useEffect, useCallback } from 'react'
import type { Service } from '../types'
import { getIconSvg, getFallbackSvg } from '../lib/icons'

function hex2rgba(hex: string, a: number) {
  const h = hex.replace('#', '')
  const r = parseInt(h.slice(0,2),16), g = parseInt(h.slice(2,4),16), b = parseInt(h.slice(4,6),16)
  if (isNaN(r)||isNaN(g)||isNaN(b)) return `rgba(80,80,120,${a})`
  return `rgba(${r},${g},${b},${a})`
}

function ServiceIcon({ service, size=34 }: { service: Service; size?: number }) {
  const [svg, setSvg] = useState<string|null>(null)
  const [ready, setReady] = useState(false)
  useEffect(() => {
    let dead = false
    getIconSvg(service.icon).then(s => { if (!dead) { setSvg(s); setReady(true) } })
    return () => { dead = true }
  }, [service.icon])
  const color = service.color ?? '#8080c0'
  if (!ready) return <div style={{ width:size, height:size }} />
  return (
    <div style={{ width:size, height:size, color, flexShrink:0 }}
      className="[&_svg]:h-full [&_svg]:w-full [&_svg]:fill-current"
      dangerouslySetInnerHTML={{ __html: svg ?? getFallbackSvg(service.name, color) }} />
  )
}

interface TileProps {
  service: Service
  isFavorite: boolean
  onToggleFavorite: (id: string) => void
  onVisit: (id: string) => void
  animDelay?: number
}

export function ServiceTile({ service, isFavorite, onToggleFavorite, onVisit, animDelay=0 }: TileProps) {
  const [hovered, setHovered] = useState(false)
  const color = service.color ?? '#6060a0'

  const handleFav = useCallback((e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation()
    onToggleFavorite(service.id)
  }, [service.id, onToggleFavorite])

  return (
    <a
      href={service.url || '#'}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => onVisit(service.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="tile-enter"
      style={{
        animationDelay: `${animDelay}ms`,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'flex-end', gap: 10,
        padding: '18px 10px 12px',
        background: hovered ? hex2rgba(color, 0.15) : hex2rgba(color, 0.06),
        border: `1px solid ${hovered ? hex2rgba(color, 0.35) : 'var(--border)'}`,
        borderRadius: 8,
        cursor: 'pointer',
        transition: 'background 0.2s, border-color 0.2s, box-shadow 0.2s, transform 0.15s',
        textDecoration: 'none',
        position: 'relative',
        aspectRatio: '1',
        minWidth: 0,
        transform: hovered ? 'scale(1.04)' : 'scale(1)',
        boxShadow: hovered ? `0 0 20px ${hex2rgba(color, 0.25)}, 0 4px 20px var(--shadow-color)` : 'none',
      }}
    >
      {/* Favorite indicator */}
      {isFavorite && !hovered && (
        <div style={{ position:'absolute', top:7, right:7, width:5, height:5,
          borderRadius:'50%', background:'#f59e0b' }} />
      )}

      {/* Favorite toggle */}
      {hovered && (
        <button onClick={handleFav} style={{
          position:'absolute', top:6, right:6, background:'none', border:'none',
          cursor:'pointer', padding:3, display:'flex',
          color: isFavorite ? '#f59e0b' : 'var(--mid)',
        }} title={isFavorite ? 'Unfavorite' : 'Favorite'}>
          <svg width={12} height={12} viewBox="0 0 20 20"
            fill={isFavorite ? 'currentColor' : 'none'}
            stroke="currentColor" strokeWidth={isFavorite ? 0 : 1.5}>
            <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" clipRule="evenodd" />
          </svg>
        </button>
      )}

      <ServiceIcon service={service} size={32} />

      <div style={{ textAlign:'center', width:'100%' }}>
        <div style={{
          fontWeight:600, fontSize:11.5,
          color: hovered ? 'var(--text-hover)' : 'var(--text)',
          letterSpacing:'-0.01em',
          whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis',
          lineHeight:1.3,
          transition: 'color 0.15s',
        }}>{service.name}</div>
        <div style={{
          fontSize:10, color:'var(--dim)', marginTop:2,
          overflow:'hidden', display:'-webkit-box',
          WebkitLineClamp:1, WebkitBoxOrient:'vertical',
          lineHeight:1.3,
        }}>{service.description}</div>
      </div>
    </a>
  )
}
