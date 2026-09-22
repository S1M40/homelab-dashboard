import { useState, useEffect, useRef, useCallback } from 'react'
import type { Service } from '../types'
import { getIconSvg, getFallbackSvg } from '../lib/icons'
import { useSearch } from '../hooks/useSearch'

/** Tiny inline icon for results list */
function ResultIcon({ service }: { service: Service }) {
  const [svg, setSvg] = useState<string|null>(null)
  useEffect(() => {
    let dead = false
    getIconSvg(service.icon).then(s => { if (!dead) setSvg(s) })
    return () => { dead = true }
  }, [service.icon])
  const color = service.color ?? '#8080c0'
  return (
    <div style={{ width:18, height:18, color, flexShrink:0 }}
      className="[&_svg]:h-full [&_svg]:w-full [&_svg]:fill-current"
      dangerouslySetInnerHTML={{ __html: svg ?? getFallbackSvg(service.name, color) }} />
  )
}

interface Props {
  services: Service[]
  onVisit: (id: string) => void
  onClose: () => void
}

export function CommandPalette({ services, onVisit, onClose }: Props) {
  const [query, setQuery] = useState('')
  const [cursor, setCursor] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const results = useSearch(services, query).slice(0, 12)

  useEffect(() => { inputRef.current?.focus() }, [])
  useEffect(() => { setCursor(0) }, [query])

  // Scroll active item into view
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-idx="${cursor}"]`)
    el?.scrollIntoView({ block: 'nearest' })
  }, [cursor])

  const launch = useCallback((service: Service) => {
    onVisit(service.id)
    window.open(service.url, '_blank', 'noopener,noreferrer')
    onClose()
  }, [onVisit, onClose])

  const handleKey = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { onClose(); return }
    if (e.key === 'ArrowDown') { e.preventDefault(); setCursor(c => Math.min(c+1, results.length-1)) }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setCursor(c => Math.max(c-1, 0)) }
    if (e.key === 'Enter' && results[cursor]) launch(results[cursor])
  }, [results, cursor, launch, onClose])

  return (
    <>
      {/* Overlay */}
      <div
        className="overlay-enter"
        onClick={onClose}
        style={{
          position:'fixed', inset:0, zIndex:50,
          background:'rgba(0,0,0,0.65)',
          backdropFilter:'blur(4px)',
        }}
      />

      {/* Palette */}
      <div
        className="palette-enter"
        style={{
          position:'fixed', top:'18%', left:'50%', transform:'translateX(-50%)',
          zIndex:51, width:'min(600px, 92vw)',
          background:'var(--modal-bg)',
          border:'1px solid var(--border-h)',
          borderRadius:12,
          overflow:'hidden',
          boxShadow:'0 24px 80px var(--shadow-color)',
        }}
      >
        {/* Search input row */}
        <div style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 16px',
          borderBottom:'1px solid var(--border)' }}>
          <svg style={{ color:'var(--dim)', flexShrink:0 }} width={15} height={15} viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Type to search services…"
            style={{
              flex:1, background:'none', border:'none', outline:'none',
              color:'var(--text)', fontSize:15, fontFamily:'inherit',
            }}
          />
          <kbd style={{
            fontSize:10, color:'var(--dim)', background:'var(--kbd-bg)',
            border:'1px solid var(--kbd-border)', borderRadius:4,
            padding:'2px 6px', fontFamily:'monospace', flexShrink:0,
          }}>Esc</kbd>
        </div>

        {/* Results */}
        <div ref={listRef} style={{ maxHeight:360, overflowY:'auto' }}>
          {!query && (
            <div style={{ padding:'28px 0', textAlign:'center', color:'var(--dim)', fontSize:12 }}>
              Start typing to search all services
            </div>
          )}
          {query && !results.length && (
            <div style={{ padding:'28px 0', textAlign:'center', color:'var(--dim)', fontSize:12 }}>
              No results for "{query}"
            </div>
          )}
          {results.map((s, i) => (
            <button
              key={s.id}
              data-idx={i}
              onClick={() => launch(s)}
              onMouseEnter={() => setCursor(i)}
              style={{
                display:'flex', alignItems:'center', gap:12,
                width:'100%', padding:'10px 16px',
                background: i === cursor ? 'var(--card-hover)' : 'none',
                border:'none', cursor:'pointer',
                borderLeft: `2px solid ${i === cursor ? (s.color ?? 'var(--mid)') : 'transparent'}`,
                transition:'background 0.1s',
                textAlign:'left',
              }}
            >
              <ResultIcon service={s} />
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ color:'var(--text)', fontWeight:500, fontSize:13 }}>{s.name}</div>
                <div style={{ color:'var(--dim)', fontSize:11, marginTop:1 }}>{s.description}</div>
              </div>
              <div style={{ fontSize:10, color:'var(--dim)', flexShrink:0,
                background:'var(--card-bg)', border:'1px solid var(--border)', padding:'2px 8px', borderRadius:4 }}>
                {s.category}
              </div>
              {i === cursor && (
                <kbd style={{ fontSize:9, color:'var(--dim)', fontFamily:'monospace',
                  background:'var(--kbd-bg)', border:'1px solid var(--kbd-border)',
                  borderRadius:3, padding:'1px 5px', flexShrink:0 }}>↵</kbd>
              )}
            </button>
          ))}
        </div>

        {/* Footer hint */}
        <div style={{ padding:'8px 16px', borderTop:'1px solid var(--border)',
          display:'flex', gap:16, fontSize:10, color:'var(--dim)' }}>
          <span><kbd style={{ fontFamily:'monospace' }}>↑↓</kbd> navigate</span>
          <span><kbd style={{ fontFamily:'monospace' }}>↵</kbd> open</span>
          <span><kbd style={{ fontFamily:'monospace' }}>Esc</kbd> close</span>
        </div>
      </div>
    </>
  )
}
