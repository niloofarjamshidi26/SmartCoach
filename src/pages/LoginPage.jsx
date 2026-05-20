import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

export default function LoginPage() {
  const { signIn, signUp } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const isDemo = location.pathname === '/demo'
  const [mode, setMode] = useState('login')
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'athlete', trainerId: '' })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      if (mode === 'login') {
        await signIn({ email: form.email, password: form.password })
        toast({ message: 'Welcome back!' })
      } else {
        await signUp({ email: form.email, password: form.password, name: form.name, role: form.role, trainerId: form.trainerId || undefined })
        toast({ message: 'Account created! Signing you in...' })
      }
    } catch (err) {
      toast({ message: err.message, type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>

      {/* Demo banner — only shown when on /demo route */}
      {isDemo && (
        <div style={{ background: '#1a3d32', borderBottom: '0.5px solid #2a5a45', padding: '8px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <div style={{ fontSize: 13, color: '#4cd4a0' }}>👀 <strong>Demo mode</strong> — sample data, nothing is saved.</div>
          <button onClick={() => navigate('/')} style={{ padding: '4px 12px', borderRadius: 6, border: '0.5px solid #2a5a45', background: 'transparent', color: '#4cd4a0', fontSize: 12, cursor: 'pointer' }}>← Back to login</button>
        </div>
      )}

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ fontSize: 28, fontWeight: 600, color: 'var(--teal)', marginBottom: 4 }}>SmartCoach</div>
            <div style={{ fontSize: 14, color: 'var(--text2)' }}>
              {mode === 'login' ? 'Sign in to your account' : 'Create your account'}
            </div>
          </div>

          <div style={{ background: 'var(--bg2)', border: '0.5px solid var(--border)', borderRadius: 14, padding: '1.75rem' }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {mode === 'signup' && (
                <>
                  <Field label="Full name" type="text" value={form.name} onChange={v => set('name', v)} required placeholder="Sara Ahmadi" />
                  <div>
                    <label style={labelStyle}>I am a</label>
                    <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                      {['athlete', 'trainer'].map(r => (
                        <button key={r} type="button" onClick={() => set('role', r)} style={{
                          flex: 1, padding: '8px', borderRadius: 8,
                          border: `1.5px solid ${form.role === r ? 'var(--teal)' : 'var(--border)'}`,
                          background: form.role === r ? 'var(--teal-light)' : 'var(--bg3)',
                          color: form.role === r ? 'var(--teal-mid)' : 'var(--text2)',
                          fontWeight: 500, cursor: 'pointer', fontSize: 13
                        }}>{r.charAt(0).toUpperCase() + r.slice(1)}</button>
                      ))}
                    </div>
                  </div>
                  {form.role === 'athlete' && (
                    <Field label="Trainer ID (ask your trainer)" type="text" value={form.trainerId} onChange={v => set('trainerId', v)} placeholder="Optional" />
                  )}
                </>
              )}
              <Field label="Email" type="email" value={form.email} onChange={v => set('email', v)} required placeholder="you@example.com" />
              <Field label="Password" type="password" value={form.password} onChange={v => set('password', v)} required placeholder="••••••••" />
              <button type="submit" disabled={loading} style={{
                width: '100%', padding: '10px', borderRadius: 8, border: 'none',
                background: 'var(--teal)', color: '#fff', fontWeight: 600, fontSize: 14,
                cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, marginTop: 4
              }}>
                {loading ? 'Please wait...' : mode === 'login' ? 'Sign in' : 'Create account'}
              </button>
            </form>
            <div style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: 'var(--text2)' }}>
              {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
              <span onClick={() => setMode(mode === 'login' ? 'signup' : 'login')} style={{ color: 'var(--teal)', cursor: 'pointer', fontWeight: 500 }}>
                {mode === 'login' ? 'Sign up' : 'Sign in'}
              </span>
            </div>
          </div>

          {/* Bottom section — shows demo link OR nothing depending on route */}
          {!isDemo && (
            <div onClick={() => navigate('/demo')} style={{ textAlign: 'center', marginTop: 14, padding: '10px 14px', borderRadius: 10, border: '0.5px solid var(--border)', background: 'var(--bg2)', cursor: 'pointer' }}>
              <span style={{ fontSize: 13, color: 'var(--text2)' }}>Just exploring? </span>
              <span style={{ fontSize: 13, color: 'var(--teal)', fontWeight: 500 }}>Try the demo →</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const labelStyle = { fontSize: 12, color: 'var(--text2)', fontWeight: 500 }

function Field({ label, type, value, onChange, required, placeholder }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} required={required} placeholder={placeholder}
        style={{ width: '100%', marginTop: 5, padding: '9px 11px', borderRadius: 8, border: '0.5px solid var(--border)', background: 'var(--bg3)', color: 'var(--text)', fontSize: 13, outline: 'none' }} />
    </div>
  )
}