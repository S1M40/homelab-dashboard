import { useState, useEffect } from 'react'
import type { Service } from '../types'
import { getIconSvg, getFallbackSvg } from '../lib/icons'

function hex2rgba(hex: string, a: number) {
  const h = hex.replace('#',''), r=parseInt(h.slice(0,2),16), g=parseInt(h.slice(2,4),16), b=parseInt(h.slice(4,6),16)
  if(isNaN(r)||isNaN(g)||isNaN(b)) return `rgba(80,80,120,${a})`
  return `rgba(${r},${g},${b},${a})`
}

function PinnedIcon({ service }: { service: Service }) {
  const [svg, setSvg] = useState<string|null>(null)
  useEffect(() => {
    let dead = false
    getIconSvg(service.icon).then(s => { if (!dead) setSvg(s) })
    return () => { dead = true }
  }, [service.icon])
  const color = service.color ?? '#8080c0'
  return (
    <div style={{ width:20, height:20, color, flexShrink:0 }}
      className="[&_svg]:h-full [&_svg]:w-full [&_svg]:fill-current"
      dangerouslySetInnerHTML={{ __html: svg ?? getFallbackSvg(service.name, color) }} />
  )
}

interface Props {
  services: Service[]  // favorites + recently visited
  onVisit: (id: string) => void
}

export function PinnedBar({ services, onVisit }: Props) {
  if (!services.length) return null
  return (
    <div style={{ borderBottom:'1px solid var(--border)', padding:'8px 16px' }}>
      <div className="pinned-scroll">
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
                display:'inline-flex', alignItems:'center', gap:7,
                padding:'5px 10px',
                background: hex2rgba(color, 0.07),
                border:`1px solid ${hex2rgba(color, 0.18)}`,
                borderRadius:6,
                flexShrink:0,
                cursor:'pointer',
                textDecoration:'none',
                transition:'background 0.15s, border-color 0.15s, transform 0.12s',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement
                el.style.background = hex2rgba(color, 0.18)
                el.style.borderColor = hex2rgba(color, 0.35)
                el.style.transform = 'translateY(-1px)'
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement
                el.style.background = hex2rgba(color, 0.07)
                el.style.borderColor = hex2rgba(color, 0.18)
                el.style.transform = 'translateY(0)'
              }}
            >
              <PinnedIcon service={s} />
              <span style={{ fontSize:11.5, fontWeight:500, color:'var(--text)', whiteSpace:'nowrap' }}>
                {s.name}
              </span>
            </a>
          )
        })}
      </div>
    </div>
  )
}
