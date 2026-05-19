import { createContext, useContext, useState, useCallback } from 'react'

const ToastContext = createContext({})

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const toast = useCallback(({ message, type = 'success', duration = 3000 }) => {
    const id = Date.now()
    setToasts(t => [...t, { id, message, type }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), duration)
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1000, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {toasts.map(t => (
          <div key={t.id} style={{
            padding: '10px 16px', borderRadius: 10, fontSize: 13, fontWeight: 500,
            background: t.type === 'success' ? '#1D9E75' : t.type === 'error' ? '#c0392b' : '#333',
            color: '#fff', boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
            animation: 'slideIn 0.2s ease',
            display: 'flex', alignItems: 'center', gap: 8
          }}>
            {t.type === 'success' ? '✓' : t.type === 'error' ? '✕' : 'ℹ'} {t.message}
          </div>
        ))}
      </div>
      <style>{`@keyframes slideIn { from { opacity:0; transform:translateY(10px) } to { opacity:1; transform:translateY(0) } }`}</style>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)