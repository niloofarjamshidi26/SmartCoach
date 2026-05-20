import { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import LoginPage from './pages/LoginPage'
import TrainerApp from './pages/trainer/TrainerApp'
import AthleteApp from './pages/athlete/AthleteApp'

export default function App() {
  const { user, profile, loading } = useAuth()
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light')
    localStorage.setItem('theme', darkMode ? 'dark' : 'light')
  }, [darkMode])


  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg)' }}>
      <div style={{ fontSize: 24, color: 'var(--teal)' }}>SmartCoach</div>
    </div>
  )

  if (!user) return <LoginPage />

  if (!profile) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <div style={{ color: 'var(--text2)' }}>Loading profile...</div>
    </div>
  )

  return (
    <Routes>
      <Route path="/*" element={
        profile.role === 'trainer'
          ? <TrainerApp darkMode={darkMode} setDarkMode={setDarkMode} />
          : <AthleteApp darkMode={darkMode} setDarkMode={setDarkMode} />
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}