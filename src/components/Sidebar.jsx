import { Avatar, Toggle } from './UI'

export function Sidebar({ nav, page, setPage, open, setOpen, isMobile, profile, signOut, darkMode, setDarkMode }) {
  return (
    <>
      {isMobile && open && (
        <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 199 }} />
      )}
      <div style={{
        width: 210, background: 'var(--bg2)', borderRight: '0.5px solid var(--border)',
        display: 'flex', flexDirection: 'column', padding: '1.25rem 0.75rem', gap: 2,
        position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 200,
        transition: 'transform 0.25s',
        transform: isMobile && !open ? 'translateX(-210px)' : 'translateX(0)'
      }}>
        <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--teal)', padding: '0 0.5rem 1.25rem', letterSpacing: '-0.02em' }}>
          SmartCoach
        </div>

        {nav.map(n => (
          <div key={n.id} onClick={() => { setPage(n.id); setOpen(false) }} style={{
            display: 'flex', alignItems: 'center', gap: 9, padding: '8px 10px', borderRadius: 8,
            fontSize: 14, color: page === n.id ? 'var(--teal-mid)' : 'var(--text2)',
            cursor: 'pointer', userSelect: 'none',
            background: page === n.id ? 'var(--teal-light)' : 'transparent',
            fontWeight: page === n.id ? 500 : 400, transition: 'background 0.15s'
          }}>
            <span style={{ fontSize: 16 }}>{n.icon}</span>{n.label}
          </div>
        ))}

        <div style={{ flex: 1 }} />

        <div style={{ padding: '0.75rem 0.5rem', borderTop: '0.5px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 12, color: 'var(--text2)' }}>{darkMode ? '🌙 Dark' : '☀️ Light'}</span>
            <Toggle on={darkMode} onToggle={() => setDarkMode(!darkMode)} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Avatar name={profile?.name || '?'} size={28} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{profile?.name}</div>
              <div style={{ fontSize: 11, color: 'var(--text3)' }}>{profile?.role}</div>
            </div>
          </div>
          <button onClick={signOut} style={{ width: '100%', padding: '6px', borderRadius: 7, border: '0.5px solid var(--border)', background: 'transparent', color: 'var(--text2)', fontSize: 12, cursor: 'pointer' }}>
            Sign out
          </button>
        </div>
      </div>
    </>
  )
}

export default Sidebar