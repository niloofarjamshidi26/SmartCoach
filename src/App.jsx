

import { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import LoginPage from './pages/LoginPage'
import TrainerApp from './pages/trainer/TrainerApp'
import AthleteApp from './pages/athlete/AthleteApp'
import DemoApp from './pages/DemoApp'

export default function App() {
  const { user, profile, loading } = useAuth()
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light')
    localStorage.setItem('theme', darkMode ? 'dark' : 'light')
  }, [darkMode])

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg)' }}>
      <div style={{ fontSize: 24, color: 'var(--teal)', fontWeight: 600 }}>SmartCoach</div>
    </div>
  )

  return (
    <Routes>
      {/* Demo route — always accessible, no auth needed */}
      <Route path="/demo" element={<DemoApp />} />

      {/* Auth routes */}
      <Route path="/*" element={
        !user
          ? <LoginPage />
          : !profile
            ? <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}><div style={{ color: 'var(--text2)' }}>Loading profile...</div></div>
            : profile.role === 'trainer'
              ? <TrainerApp darkMode={darkMode} setDarkMode={setDarkMode} />
              : <AthleteApp darkMode={darkMode} setDarkMode={setDarkMode} />
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
/*
return (
  <Routes>
    <Route path="/demo" element={<DemoApp />} />
    <Route path="/*" element={
      !user
        ? <LoginPage />
        : !profile
        ? <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh' }}><div style={{ color:'var(--text2)' }}>Loading profile...</div></div>
        : profile.role === 'trainer'
        ? <TrainerApp darkMode={darkMode} setDarkMode={setDarkMode} />
        : <AthleteApp darkMode={darkMode} setDarkMode={setDarkMode} />
    } />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
)
  }
*/

