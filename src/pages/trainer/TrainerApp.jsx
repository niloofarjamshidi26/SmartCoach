import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { supabase } from '../../lib/supabase'
import Sidebar from '../../components/Sidebar'
import TrainerDashboard from './TrainerDashboard'
import TrainerAthletes from './TrainerAthletes'
import TrainerExercises from './TrainerExercises'
import TrainerPlans from './TrainerPlans'
import TrainerFinance from './TrainerFinance'

export default function TrainerApp({ darkMode, setDarkMode }) {
  const { profile, signOut } = useAuth()
  const { toast } = useToast()
  const [page, setPage] = useState('dashboard')
  const [sideOpen, setSideOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const [athletes, setAthletes] = useState([])
  const [exercises, setExercises] = useState([])

  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])

  useEffect(() => { fetchAthletes(); fetchExercises() }, [])

  async function fetchAthletes() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('trainer_id', profile.id)
      .eq('role', 'athlete')
    if (error) toast({ message: error.message, type: 'error' })
    else setAthletes(data || [])
  }

  async function fetchExercises() {
    const { data, error } = await supabase
      .from('exercise')
      .select('*')
      .eq('trainer_id', profile.id)
      .order('created_at', { ascending: false })
    if (error) toast({ message: error.message, type: 'error' })
    else setExercises(data || [])
  }

  const nav = [
    { id: 'dashboard',  label: 'Dashboard',  icon: '🏠' },
    { id: 'athletes',   label: 'Athletes',    icon: '👥' },
    { id: 'exercises',  label: 'Exercises',   icon: '🏋️' },
    { id: 'plans',      label: 'Plans',       icon: '📋' },
    { id: 'finance',    label: 'Finance',     icon: '💳' },
  ]

  const pages = {
    dashboard: <TrainerDashboard athletes={athletes} profile={profile} />,
    athletes:  <TrainerAthletes athletes={athletes} profile={profile} refresh={fetchAthletes} />,
    exercises: <TrainerExercises exercises={exercises} profile={profile} refresh={fetchExercises} />,
    plans:     <TrainerPlans athletes={athletes} exercises={exercises} profile={profile} />,
    finance:   <TrainerFinance athletes={athletes} profile={profile} />,
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      <Sidebar nav={nav} page={page} setPage={setPage} open={sideOpen} setOpen={setSideOpen}
        isMobile={isMobile} profile={profile} signOut={signOut}
        darkMode={darkMode} setDarkMode={setDarkMode} />
      <div style={{ flex: 1, marginLeft: isMobile ? 0 : 210, padding: isMobile ? '1rem' : '1.5rem', minWidth: 0 }}>
        {isMobile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.5rem' }}>
            <button onClick={() => setSideOpen(s => !s)} style={{ background: 'var(--bg3)', border: '0.5px solid var(--border)', borderRadius: 8, padding: '7px 10px', cursor: 'pointer', fontSize: 16, color: 'var(--text)' }}>☰</button>
            <div style={{ fontSize: 16, fontWeight: 500, color: 'var(--teal)' }}>SmartCoach</div>
          </div>
        )}
        {pages[page]}
      </div>
    </div>
  )
}