// Save this as src/components/Modal.jsx

export default function Modal({ title, onClose, children, maxWidth = 420 }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={onClose}>
      <div style={{ background: 'var(--bg2)', border: '0.5px solid var(--border)', borderRadius: 16, padding: '1.5rem', width: '100%', maxWidth, boxShadow: '0 8px 32px rgba(0,0,0,0.3)', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 16, fontWeight: 500, color: 'var(--text)' }}>{title}</div>
          <Btn size="sm" onClick={onClose}>✕</Btn>
        </div>
        {children}
      </div>
    </div>
  )
}
