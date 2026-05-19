// ─── UI.jsx ───────────────────────────────────────────────────────────────────
// Save this as src/components/UI.jsx

export function Card({ children, style = {} }) {
  return <div style={{ background: 'var(--bg2)', border: '0.5px solid var(--border)', borderRadius: 12, padding: '1rem 1.25rem', ...style }}>{children}</div>
}

export function Metric({ label, value, color }) {
  return (
    <div style={{ background: 'var(--bg3)', borderRadius: 8, padding: '1rem' }}>
      <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 500, color: color || 'var(--text)' }}>{value}</div>
    </div>
  )
}

export function Badge({ variant = 'gray', children }) {
  const styles = {
    teal:  { background: 'var(--teal-light)', color: 'var(--teal-mid)' },
    amber: { background: 'var(--amber-light)', color: 'var(--amber-dark)' },
    red:   { background: '#3d1212', color: '#f07070' },
    gray:  { background: 'var(--bg3)', color: 'var(--text2)' },
    green: { background: '#dcfce7', color: '#166534' },
  }
  return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 9px', borderRadius: 99, fontSize: 11, fontWeight: 500, ...(styles[variant] || styles.gray) }}>{children}</span>
}

export function Btn({ variant = 'ghost', size = 'md', onClick, children, style = {}, disabled = false, type = 'button' }) {
  const base = { border: 'none', borderRadius: 8, fontWeight: 500, cursor: disabled ? 'not-allowed' : 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6, transition: 'opacity 0.15s', opacity: disabled ? 0.6 : 1 }
  const sizes = { sm: { padding: '4px 10px', fontSize: 12 }, md: { padding: '7px 14px', fontSize: 13 } }
  const variants = {
    primary:   { background: 'var(--teal)', color: '#fff' },
    secondary: { background: 'transparent', border: '1.5px solid var(--teal)', color: 'var(--teal)' },
    ghost:     { background: 'var(--bg3)', color: 'var(--text)', border: '0.5px solid var(--border)' },
    danger:    { background: '#3d1212', color: '#f07070', border: 'none' },
  }
  return <button type={type} disabled={disabled} style={{ ...base, ...sizes[size], ...(variants[variant] || variants.ghost), ...style }} onClick={onClick}>{children}</button>
}

export function STitle({ children, style = {} }) {
  return <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)', marginBottom: '0.75rem', ...style }}>{children}</div>
}

export function Avatar({ name = '?', size = 34 }) {
  const ini = (name || '?').split(' ').map(x => x[0]).join('').slice(0, 2).toUpperCase()
  return <div style={{ width: size, height: size, borderRadius: '50%', background: 'var(--teal-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 500, color: 'var(--teal-mid)', fontSize: size * 0.35, flexShrink: 0 }}>{ini}</div>
}

export function Divider() {
  return <div style={{ borderTop: '0.5px solid var(--border)', margin: '1rem 0' }} />
}

export function Toggle({ on, onToggle }) {
  return (
    <div onClick={onToggle} style={{ width: 40, height: 22, borderRadius: 99, background: on ? 'var(--teal)' : 'var(--bg3)', border: `0.5px solid ${on ? 'var(--teal)' : 'var(--border)'}`, position: 'relative', cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0 }}>
      <div style={{ position: 'absolute', top: 3, left: on ? 21 : 3, width: 16, height: 16, borderRadius: '50%', background: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.25)' }} />
    </div>
  )
}

export function EmptyState({ message }) {
  return <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text2)', fontSize: 14 }}>{message}</div>
}
 