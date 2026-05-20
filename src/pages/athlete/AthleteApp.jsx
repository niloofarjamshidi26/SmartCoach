import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { useToast } from '../../context/ToastContext'
import { Sidebar } from '../../components/Sidebar'
import { Card, STitle, Btn, Badge, Avatar, Metric, Divider, Toggle } from '../../components/UI'

const MOODS = ['😞','😐','🙂','😄','🔥']
const AMBER = '#EF9F27'
const TEAL  = '#1D9E75'

export default function AthleteApp({ darkMode, setDarkMode }) {
  const { profile, signOut, refreshProfile } = useAuth()
  const { toast } = useToast()
  const [page, setPage] = useState('profile')
  const [sideOpen, setSideOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const [plan, setPlan] = useState(null)
  const [planExs, setPlanExs] = useState([])
  const [journal, setJournal] = useState([])
  const [body, setBody] = useState([])
  const [badges, setBadges] = useState([])
  const [finance, setFinance] = useState([])
  const [memberOpen, setMemberOpen] = useState(false)

  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])

  useEffect(() => {
    fetchPlan(); fetchJournal(); fetchBody(); fetchBadges(); fetchFinance()
  }, [])
  
/*  useEffect(() => {
  if (profile && !profile.age && !profile.height) {
    setPage('profile')
    toast({ message: 'Welcome! Please complete your profile 👋' })
  }
  }, [profile])
*/
  async function fetchPlan() {
    const { data } = await supabase.from('plan').select('*, plan_exercise(*, exercise(name,type,target_area))').eq('athlete_id', profile.id).limit(1).single()
    if (data) { setPlan(data); setPlanExs(data.plan_exercise||[]) }
  }

  async function fetchJournal() {
    const { data } = await supabase.from('journal').select('*, exercise(name)').eq('athlete_id', profile.id).order('date', { ascending:false }).limit(20)
    setJournal(data||[])
  }

  async function fetchBody() {
    const { data } = await supabase.from('body').select('*').eq('athlete_id', profile.id).order('date', { ascending:true })
    setBody(data||[])
  }

  async function fetchBadges() {
    const { data } = await supabase.from('athlete_badge').select('*, badge_definition(name,icon,description)').eq('athlete_id', profile.id)
    setBadges(data||[])
  }

  async function fetchFinance() {
    const { data } = await supabase.from('finance').select('*').eq('athlete_id', profile.id).order('date', { ascending:false })
    setFinance(data||[])
  }

  const prs = journal.reduce((acc, j) => {
    if (!j.exercise?.name || !j.weight_used) return acc
    const name = j.exercise.name
    if (!acc[name] || j.weight_used > acc[name].weight) acc[name] = { weight: j.weight_used, date: j.date }
    return acc
  }, {})

  const nav = [
    { id:'profile',      label:'Profile',      icon:'👤' },
    { id:'dashboard',    label:'Dashboard',    icon:'🏠' },
    { id:'myplan',       label:'My plan',      icon:'📋' },
    { id:'progress',     label:'Progress',     icon:'📈' },
    { id:'achievements', label:'Achievements', icon:'🏆' },
  ]

  // ── Pages ──────────────────────────────────────────────────────────────────
  function EditField({ label, value, onChange, placeholder, type = 'text' }) {
  return (
    <div>
      <label style={{ fontSize: 12, color: 'var(--text2)', fontWeight: 500 }}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ width: '100%', marginTop: 5, padding: '8px 10px', borderRadius: 8, border: '0.5px solid var(--border)', background: 'var(--bg3)', color: 'var(--text)', fontSize: 13, outline: 'none' }} />
    </div>
  )
}

function ProfilePage() {
  const [showEdit, setShowEdit] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: profile.name || '',
    age: profile.age || '',
    height: profile.height || '',
    language: profile.language || 'en',
  })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const { toast } = useToast()
  const latestFinance = finance[0]

  async function saveProfile() {
    setSaving(true)
    const { error } = await supabase.from('profiles').update({
      name: form.name,
      age: form.age ? parseInt(form.age) : null,
      height: form.height ? parseInt(form.height) : null,
      language: form.language,
    }).eq('id', profile.id)
    if (error) {
      toast({ message: error.message, type: 'error' })
    } else {
      toast({ message: 'Profile updated ✓' })
      setShowEdit(false)
      refreshProfile()
    }
    setSaving(false)
  }

  return (
    <div>
      {showEdit && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
          zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
        }} onClick={() => setShowEdit(false)}>
          <div style={{
            background: 'var(--bg2)', border: '0.5px solid var(--border)',
            borderRadius: 16, padding: '1.5rem', width: '100%', maxWidth: 420,
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ fontSize: 16, fontWeight: 500, color: 'var(--text)' }}>Edit profile</div>
              <button onClick={() => setShowEdit(false)} style={{ background: 'var(--bg3)', border: '0.5px solid var(--border)', borderRadius: 8, padding: '4px 10px', cursor: 'pointer', color: 'var(--text)', fontSize: 12 }}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <EditField label="Full name" value={form.name} onChange={v => set('name', v)} placeholder="Your name" />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <EditField label="Age" type="number" value={form.age} onChange={v => set('age', v)} placeholder="28" />
                <EditField label="Height (cm)" type="number" value={form.height} onChange={v => set('height', v)} placeholder="170" />
              </div>
              <div>
                <label style={{ fontSize: 12, color: 'var(--text2)', fontWeight: 500 }}>Language</label>
                <select value={form.language} onChange={e => set('language', e.target.value)}
                  style={{ width: '100%', marginTop: 5, padding: '8px 10px', borderRadius: 8, border: '0.5px solid var(--border)', background: 'var(--bg3)', color: 'var(--text)', fontSize: 13, outline: 'none' }}>
                  <option value="en">English</option>
                  <option value="fa">Persian (فارسی)</option>
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 4 }}>
                <button onClick={saveProfile} disabled={saving} style={{
                  padding: '8px 20px', borderRadius: 8, border: 'none',
                  background: 'var(--teal)', color: '#fff', fontWeight: 500,
                  fontSize: 13, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1
                }}>{saving ? 'Saving...' : 'Save profile'}</button>
                <button onClick={() => setShowEdit(false)} style={{
                  padding: '8px 16px', borderRadius: 8, border: '0.5px solid var(--border)',
                  background: 'var(--bg3)', color: 'var(--text)', fontWeight: 500, fontSize: 13, cursor: 'pointer'
                }}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div style={{ fontSize: 22, fontWeight: 500, color: 'var(--text)' }}>Profile</div>
      <div style={{ fontSize: 14, color: 'var(--text2)', marginTop: 2, marginBottom: '1.5rem' }}>Your personal info and account</div>
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12 }}>
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
            <Avatar name={profile.name} size={56} />
            <div>
              <div style={{ fontSize: 17, fontWeight: 500, color: 'var(--text)' }}>{profile.name}</div>
              <div style={{ fontSize: 13, color: 'var(--text2)' }}>Athlete</div>
            </div>
          </div>
          <Divider />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
            {[['Age', profile.age || '—'], ['Height', profile.height ? `${profile.height}cm` : '—'], ['Language', profile.language === 'fa' ? 'Persian' : 'English']].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: 12, color: 'var(--text2)' }}>{k}</div>
                <div style={{ fontSize: 13, color: 'var(--text)' }}>{v}</div>
              </div>
            ))}
          </div>
          <Divider />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 13, color: 'var(--text)' }}>Dark mode</div>
              <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 1 }}>Switch appearance</div>
            </div>
            <Toggle on={darkMode} onToggle={() => setDarkMode(!darkMode)} />
          </div>
          <div onClick={() => setMemberOpen(!memberOpen)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', padding: '8px 10px', background: 'var(--bg3)', borderRadius: 8, marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: latestFinance?.paid === false ? AMBER : TEAL }} />
              <span style={{ fontSize: 13, color: 'var(--text2)' }}>Membership · <span style={{ color: latestFinance?.paid === false ? AMBER : TEAL, fontWeight: 500 }}>{latestFinance?.paid === false ? 'Payment due' : 'Active'}</span></span>
            </div>
            <span style={{ fontSize: 11, color: 'var(--text3)' }}>{memberOpen ? '▲' : '▼'}</span>
          </div>
          {memberOpen && (
            <div style={{ padding: '10px 12px', background: 'var(--bg3)', borderRadius: 8, marginBottom: 12 }}>
              {finance.slice(0, 3).map((f, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: i < 2 ? '0.5px solid var(--border)' : 'none' }}>
                  <span style={{ fontSize: 12, color: 'var(--text2)' }}>{f.date} · {f.currency} {f.amount}</span>
                  <Badge variant={f.paid ? 'teal' : 'amber'}>{f.paid ? 'Paid' : 'Due'}</Badge>
                </div>
              ))}
              {finance.length === 0 && <div style={{ fontSize: 12, color: 'var(--text3)' }}>No payment records yet.</div>}
            </div>
          )}
          <button onClick={() => setShowEdit(true)} style={{
            width: '100%', padding: '8px', borderRadius: 8,
            border: '0.5px solid var(--border)', background: 'var(--bg3)',
            color: 'var(--text)', fontSize: 13, cursor: 'pointer', fontWeight: 500
          }}>Edit profile</button>
        </Card>
        <Card>
          <STitle>Recent activity</STitle>
          {journal.slice(0, 6).map((j, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '0.5px solid var(--border)' }}>
              <div style={{ fontSize: 11, color: 'var(--text3)', width: 52 }}>{j.date}</div>
              <div style={{ flex: 1, fontSize: 13, color: 'var(--text)' }}>{j.exercise?.name || 'Session'}</div>
              <span style={{ fontSize: 14 }}>{MOODS[(j.athlete_mood || 3) - 1]}</span>
            </div>
          ))}
          {journal.length === 0 && <div style={{ fontSize: 13, color: 'var(--text3)' }}>No sessions yet.</div>}
        </Card>
      </div>
    </div>
  )
}
/*
  function ProfilePage() {
    const latestFinance = finance[0]
    return (
      <div>
        <div style={{fontSize:22,fontWeight:500,color:'var(--text)'}}>Profile</div>
        <div style={{fontSize:14,color:'var(--text2)',marginTop:2,marginBottom:'1.5rem'}}>Your personal info and account</div>
        <div style={{display:'grid',gridTemplateColumns:isMobile?'1fr':'1fr 1fr',gap:12}}>
          <Card>
            <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:16}}>
              <Avatar name={profile.name} size={56}/>
              <div>
                <div style={{fontSize:17,fontWeight:500,color:'var(--text)'}}>{profile.name}</div>
                <div style={{fontSize:13,color:'var(--text2)'}}>Athlete</div>
              </div>
            </div>
            <Divider/>
            <div style={{display:'flex',flexDirection:'column',gap:10,marginBottom:16}}>
              {[['Age', profile.age||'—'], ['Height', profile.height?`${profile.height}cm`:'—'], ['Language', profile.language==='fa'?'Persian':'English']].map(([k,v])=>(
                <div key={k} style={{display:'flex',justifyContent:'space-between'}}>
                  <span style={{fontSize:12,color:'var(--text2)'}}>{k}</span>
                  <span style={{fontSize:13,color:'var(--text)'}}>{v}</span>
                </div>
              ))}
            </div>
            <Divider/>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
              <div>
                <div style={{fontSize:13,color:'var(--text)'}}>Dark mode</div>
                <div style={{fontSize:11,color:'var(--text3)',marginTop:1}}>Switch appearance</div>
              </div>
              <Toggle on={darkMode} onToggle={()=>setDarkMode(!darkMode)}/>
            </div>
            <div onClick={()=>setMemberOpen(!memberOpen)} style={{display:'flex',justifyContent:'space-between',alignItems:'center',cursor:'pointer',padding:'8px 10px',background:'var(--bg3)',borderRadius:8,marginBottom:12}}>
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                <div style={{width:8,height:8,borderRadius:'50%',background:latestFinance?.paid===false?AMBER:TEAL}}/>
                <span style={{fontSize:13,color:'var(--text2)'}}>Membership · <span style={{color:latestFinance?.paid===false?AMBER:TEAL,fontWeight:500}}>{latestFinance?.paid===false?'Payment due':'Active'}</span></span>
              </div>
              <span style={{fontSize:11,color:'var(--text3)'}}>{memberOpen?'▲':'▼'}</span>
            </div>
            {memberOpen && (
              <div style={{padding:'10px 12px',background:'var(--bg3)',borderRadius:8,marginBottom:12}}>
                {finance.slice(0,3).map((f,i)=>(
                  <div key={i} style={{display:'flex',justifyContent:'space-between',padding:'5px 0',borderBottom:i<2?'0.5px solid var(--border)':'none'}}>
                    <span style={{fontSize:12,color:'var(--text2)'}}>{f.date} · {f.currency} {f.amount}</span>
                    <Badge variant={f.paid?'teal':'amber'}>{f.paid?'Paid':'Due'}</Badge>
                  </div>
                ))}
                {finance.length===0 && <div style={{fontSize:12,color:'var(--text3)'}}>No payment records yet.</div>}
              </div>
            )}
            <Btn style={{width:"100%", justifyContent:"center"}}>Edit profile</Btn>
          </Card>
          <Card>
            <STitle>Recent activity</STitle>
            {journal.slice(0,6).map((j,i)=>(
              <div key={i} style={{display:'flex',alignItems:'center',gap:10,padding:'8px 0',borderBottom:'0.5px solid var(--border)'}}>
                <div style={{fontSize:11,color:'var(--text3)',width:52}}>{j.date}</div>
                <div style={{flex:1,fontSize:13,color:'var(--text)'}}>{j.exercise?.name||'Session'}</div>
                <span style={{fontSize:14}}>{MOODS[(j.athlete_mood||3)-1]}</span>
              </div>
            ))}
            {journal.length===0 && <div style={{fontSize:13,color:'var(--text3)'}}>No sessions yet.</div>}
          </Card>
        </div>
      </div>
    )
  }*/

  function DashboardPage() {
    const prList = Object.entries(prs).slice(0,3)
    return (
      <div>
        <div style={{fontSize:22,fontWeight:500,color:'var(--text)'}}>Hey {profile.name.split(' ')[0]} 👋</div>
        <div style={{fontSize:14,color:'var(--text2)',marginTop:2,marginBottom:'1.5rem'}}>
          {new Date().toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'})}
        </div>
        {prList.length>0 && (
          <Card style={{marginBottom:14,borderLeft:'3px solid '+AMBER}}>
            <STitle>🏆 Your latest PRs</STitle>
            <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
              {prList.map(([name,pr],i)=>(
                <div key={i} style={{flex:1,minWidth:90,background:'var(--amber-light)',borderRadius:8,padding:'8px 12px'}}>
                  <div style={{fontSize:12,color:'var(--amber-dark)',marginBottom:2}}>{name}</div>
                  <div style={{fontSize:18,fontWeight:500,color:AMBER}}>{pr.weight}kg</div>
                  <div style={{fontSize:11,color:'var(--text3)',marginTop:2}}>{pr.date}</div>
                </div>
              ))}
            </div>
          </Card>
        )}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12,marginBottom:14}}>
          <Metric label="Sessions" value={journal.length} color={TEAL}/>
          <div style={{background:'var(--teal-light)',border:'0.5px solid var(--teal-border)',borderRadius:12,padding:'1rem 1.25rem'}}>
            <div style={{fontSize:11,color:'var(--teal-mid)',marginBottom:2}}>🔥 Streak</div>
            <div style={{fontSize:24,fontWeight:500,color:'var(--teal-deep)'}}>{profile.streak_count||0}</div>
            <div style={{fontSize:11,color:'var(--teal-mid)'}}>days</div>
          </div>
          <Metric label="PRs" value={Object.keys(prs).length} color={AMBER}/>
        </div>
        {plan && (
          <Card>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
              <STitle style={{marginBottom:0}}>Today's session</STitle>
              <Badge variant="teal">{plan.name}</Badge>
            </div>
            {planExs.slice(0,4).map((ex,i)=>(
              <div key={ex.id} style={{display:'flex',alignItems:'center',gap:10,padding:'8px 0',borderBottom:i<planExs.length-1?'0.5px solid var(--border)':'none'}}>
                <div style={{width:22,height:22,borderRadius:6,background:'var(--teal-light)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,color:'var(--teal-mid)',fontWeight:500}}>{i+1}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:500,color:'var(--text)'}}>{ex.exercise?.name}</div>
                  <div style={{fontSize:11,color:'var(--text2)'}}>{ex.sets} sets · {ex.reps} reps{ex.weight_kg?` · ${ex.weight_kg}kg`:''}</div>
                </div>
              </div>
            ))}
          </Card>
        )}
      </div>
    )
  }

  function MyPlanPage() {
    const byDay = planExs.reduce((acc,ex)=>{
      const d = ex.day_of_week||'General'
      if (!acc[d]) acc[d]=[]
      acc[d].push(ex); return acc
    },{})
    return (
      <div>
        <div style={{fontSize:22,fontWeight:500,color:'var(--text)'}}>My plan</div>
        <div style={{fontSize:14,color:'var(--text2)',marginTop:2,marginBottom:'1.5rem'}}>{plan?plan.name:'No plan assigned yet'}</div>
        {!plan
          ? <Card><div style={{textAlign:'center',padding:'2rem',color:'var(--text2)'}}>Your trainer hasn't assigned a plan yet.</div></Card>
          : (
            <div style={{display:'grid',gridTemplateColumns:isMobile?'1fr':'1fr 1fr',gap:12}}>
              <div>
                {Object.entries(byDay).map(([day,exs])=>(
                  <Card key={day} style={{marginBottom:12}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
                      <div style={{fontSize:14,fontWeight:500,color:'var(--text)'}}>{day}</div>
                      <Badge variant="teal">{exs.length} exercises</Badge>
                    </div>
                    {exs.map((ex,j)=>(
                      <div key={ex.id} style={{display:'flex',alignItems:'center',gap:10,padding:'7px 0',borderBottom:j<exs.length-1?'0.5px solid var(--border)':'none'}}>
                        <div style={{width:20,height:20,borderRadius:5,background:'var(--teal-light)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,color:'var(--teal-mid)',fontWeight:500}}>{j+1}</div>
                        <div style={{flex:1,fontSize:13,color:'var(--text)'}}>{ex.exercise?.name}</div>
                        <div style={{fontSize:11,color:'var(--text2)'}}>{ex.sets}×{ex.reps}{ex.weight_kg?` · ${ex.weight_kg}kg`:''}</div>
                      </div>
                    ))}
                  </Card>
                ))}
              </div>
              <Card>
                <STitle>Session history</STitle>
                {journal.slice(0,10).map((j,i)=>(
                  <div key={i} style={{padding:'9px 0',borderBottom:'0.5px solid var(--border)'}}>
                    <div style={{display:'flex',justifyContent:'space-between'}}>
                      <div style={{fontSize:13,fontWeight:500,color:'var(--text)'}}>{j.exercise?.name||'Session'}</div>
                      <span style={{fontSize:11,color:'var(--text3)'}}>{j.date}</span>
                    </div>
                    <div style={{fontSize:11,color:'var(--text2)',marginTop:2}}>
                      {j.sets_done} sets · {j.reps_done} reps{j.weight_used?` · ${j.weight_used}kg`:''} · {MOODS[(j.athlete_mood||3)-1]}
                    </div>
                    {j.note&&<div style={{fontSize:11,color:'var(--teal-mid)',marginTop:2,fontStyle:'italic'}}>{j.note}</div>}
                  </div>
                ))}
                {journal.length===0&&<div style={{fontSize:13,color:'var(--text3)'}}>No sessions logged yet.</div>}
              </Card>
            </div>
          )
        }
      </div>
    )
  }

  function ProgressPage() {
    if (body.length < 2) return (
      <div>
        <div style={{fontSize:22,fontWeight:500,color:'var(--text)'}}>Progress</div>
        <div style={{fontSize:14,color:'var(--text2)',marginTop:2,marginBottom:'1.5rem'}}>Your metrics over time</div>
        <Card><div style={{textAlign:'center',padding:'2rem',color:'var(--text2)'}}>Not enough data yet. Your trainer will add body measurements over time.</div></Card>
      </div>
    )
    const latest = body[body.length-1], first = body[0]
    return (
      <div>
        <div style={{fontSize:22,fontWeight:500,color:'var(--text)'}}>Progress</div>
        <div style={{fontSize:14,color:'var(--text2)',marginTop:2,marginBottom:'1.5rem'}}>Your body metrics over time</div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12,marginBottom:14}}>
          <Metric label="Current weight" value={`${latest.weight}kg`}/>
          <Metric label="Weight change" value={`${(latest.weight-first.weight)>0?'+':''}${(latest.weight-first.weight).toFixed(1)}kg`} color={latest.weight<first.weight?TEAL:'#f07070'}/>
          <Metric label="Muscle mass" value={latest.muscle_mass?`${latest.muscle_mass}%`:'—'} color={TEAL}/>
        </div>
        <Card>
          <STitle>Body measurements history</STitle>
          <div style={{overflowX:'auto'}}>x
            <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
              <thead>
                <tr>{['Date','Weight','Waist','Muscle'].map(h=>(
                  <th key={h} style={{textAlign:'left',padding:'6px 0',fontSize:11,color:'var(--text3)',fontWeight:500,borderBottom:'0.5px solid var(--border)'}}>{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {body.slice().reverse().map((b,i)=>(
                  <tr key={i}>
                    <td style={{padding:'8px 0',color:'var(--text2)',borderBottom:'0.5px solid var(--border)'}}>{b.date}</td>
                    <td style={{padding:'8px 0',fontWeight:500,color:'var(--text)',borderBottom:'0.5px solid var(--border)'}}>{b.weight}kg</td>
                    <td style={{padding:'8px 0',color:'var(--text2)',borderBottom:'0.5px solid var(--border)'}}>{b.waist?`${b.waist}cm`:'—'}</td>
                    <td style={{padding:'8px 0',color:TEAL,fontWeight:500,borderBottom:'0.5px solid var(--border)'}}>{b.muscle_mass?`${b.muscle_mass}%`:'—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    )
  }

  function AchievementsPage() {
    const allBadges = [
      {trigger:'sessions_1',icon:'⭐',name:'First session'},{trigger:'sessions_10',icon:'💪',name:'10 sessions'},
      {trigger:'sessions_25',icon:'🎯',name:'25 sessions'},{trigger:'sessions_50',icon:'🔱',name:'50 sessions'},
      {trigger:'streak_7',icon:'🔥',name:'7-day streak'},{trigger:'streak_30',icon:'🌟',name:'30-day streak'},
      {trigger:'first_pr',icon:'🏆',name:'First PR'},{trigger:'consistent_4w',icon:'📅',name:'Consistent'},
    ]
    const earnedTriggers = badges.map(b=>b.badge_definition?.trigger||'')
    return (
      <div>
        <div style={{fontSize:22,fontWeight:500,color:'var(--text)'}}>Achievements</div>
        <div style={{fontSize:14,color:'var(--text2)',marginTop:2,marginBottom:'1.5rem'}}>Your badges and milestones</div>
        <div style={{display:'grid',gridTemplateColumns:isMobile?'1fr':'1fr 1fr',gap:12}}>
          <Card>
            <STitle>Badges</STitle>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
              {allBadges.map((b,i)=>{
                const earned = earnedTriggers.includes(b.trigger)
                return (
                  <div key={i} style={{display:'flex',alignItems:'center',gap:10,padding:'8px 10px',background:earned?'var(--teal-light)':'var(--bg3)',borderRadius:8,border:`0.5px solid ${earned?'var(--teal-border)':'var(--border)'}`,opacity:earned?1:0.5}}>
                    <div style={{fontSize:22}}>{earned?b.icon:'🔒'}</div>
                    <div style={{fontSize:12,fontWeight:500,color:earned?'var(--teal-mid)':'var(--text3)'}}>{b.name}</div>
                  </div>
                )
              })}
            </div>
          </Card>
          <div>
            <div style={{background:'var(--teal-light)',border:'0.5px solid var(--teal-border)',borderRadius:12,padding:'1rem 1.25rem',marginBottom:12}}>
              <div style={{fontSize:12,color:'var(--teal-mid)',marginBottom:4}}>🔥 Current streak</div>
              <div style={{fontSize:36,fontWeight:500,color:'var(--teal-deep)'}}>{profile.streak_count||0}</div>
              <div style={{fontSize:12,color:'var(--teal-mid)'}}>days in a row</div>
            </div>
            <Card>
              <STitle>Stats</STitle>
              <div style={{display:'flex',flexDirection:'column',gap:8}}>
                <div style={{display:'flex',justifyContent:'space-between'}}><span style={{fontSize:13,color:'var(--text2)'}}>Total sessions</span><strong style={{color:'var(--text)'}}>{journal.length}</strong></div>
                <div style={{display:'flex',justifyContent:'space-between'}}><span style={{fontSize:13,color:'var(--text2)'}}>Badges earned</span><strong style={{color:'var(--teal)'}}>{badges.length}</strong></div>
                <div style={{display:'flex',justifyContent:'space-between'}}><span style={{fontSize:13,color:'var(--text2)'}}>Personal records</span><strong style={{color:AMBER}}>{Object.keys(prs).length}</strong></div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  const pages = { profile:<ProfilePage/>, dashboard:<DashboardPage/>, myplan:<MyPlanPage/>, progress:<ProgressPage/>, achievements:<AchievementsPage/> }

  return (
    <div style={{display:'flex',minHeight:'100vh',background:'var(--bg)'}}>
      <Sidebar nav={nav} page={page} setPage={setPage} open={sideOpen} setOpen={setSideOpen}
        isMobile={isMobile} profile={profile} signOut={signOut}
        darkMode={darkMode} setDarkMode={setDarkMode}/>
      <div style={{flex:1,marginLeft:isMobile?0:210,padding:isMobile?'1rem':'1.5rem',minWidth:0}}>
        {isMobile && (
          <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:'1.5rem'}}>
            <button onClick={()=>setSideOpen(s=>!s)} style={{background:'var(--bg3)',border:'0.5px solid var(--border)',borderRadius:8,padding:'7px 10px',cursor:'pointer',fontSize:16,color:'var(--text)'}}>☰</button>
            <div style={{fontSize:16,fontWeight:500,color:TEAL}}>SmartCoach</div>
          </div>
        )}
        {pages[page]}
      </div>
    </div>
  )
}