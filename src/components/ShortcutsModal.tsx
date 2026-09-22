interface Props {
  onClose: () => void
}

export function ShortcutsModal({ onClose }: Props) {
  const shortcuts = [
    { key: '⌘ K  or  /', desc: 'Open Command Palette launcher' },
    { key: '↑  /  ↓', desc: 'Navigate search results' },
    { key: 'Enter', desc: 'Open selected service' },
    { key: 'G', desc: 'Toggle Grid / List view mode' },
    { key: 'T', desc: 'Cycle Theme (Dark / Light / Auto)' },
    { key: '?', desc: 'Show keyboard shortcuts' },
    { key: 'Esc', desc: 'Close any modal or search' },
  ]

  return (
    <>
      <div
        className="overlay-enter"
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 60,
          background: 'rgba(0,0,0,0.65)',
          backdropFilter: 'blur(4px)',
        }}
      />
      <div
        className="palette-enter"
        style={{
          position: 'fixed',
          top: '25%',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 61,
          width: 'min(460px, 92vw)',
          background: 'var(--modal-bg)',
          border: '1px solid var(--border-h)',
          borderRadius: 12,
          padding: '20px',
          boxShadow: '0 24px 80px var(--shadow-color)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--text)' }}>Keyboard Shortcuts</span>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--dim)',
              cursor: 'pointer',
              fontSize: 14,
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {shortcuts.map(s => (
            <div
              key={s.desc}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '6px 0',
                borderBottom: '1px solid var(--border)',
              }}
            >
              <span style={{ fontSize: 12, color: 'var(--mid)' }}>{s.desc}</span>
              <kbd
                style={{
                  fontSize: 11,
                  color: 'var(--text)',
                  background: 'var(--kbd-bg)',
                  border: '1px solid var(--kbd-border)',
                  borderRadius: 5,
                  padding: '3px 8px',
                  fontFamily: 'monospace',
                }}
              >
                {s.key}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
