import type { ConfigError } from '../types'

export function ErrorBanner({ error }: { error: ConfigError }) {
  const titles: Record<ConfigError['type'], string> = {
    fetch: 'Configuration Load Failed',
    parse: 'Malformed JSON Error',
    validation: 'Schema Validation Issue',
  }

  return (
    <div
      style={{
        padding: '12px 16px',
        marginBottom: 16,
        background: 'rgba(239, 68, 68, 0.08)',
        border: '1px solid rgba(239, 68, 68, 0.25)',
        borderRadius: 8,
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
      }}
    >
      <span style={{ color: '#ef4444', fontSize: 16 }}>⚠</span>
      <div style={{ flex: 1 }}>
        <div style={{ color: '#fca5a5', fontWeight: 600, fontSize: 12 }}>
          {titles[error.type]}
        </div>
        <div style={{ color: 'var(--mid)', fontSize: 11, marginTop: 2, fontFamily: 'monospace' }}>
          {error.message}
        </div>
      </div>
    </div>
  )
}
