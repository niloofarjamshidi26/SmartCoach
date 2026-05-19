import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useToast } from '../../context/ToastContext'
import { Card, STitle, Btn, Badge, Avatar, Metric } from '../../components/UI'
import Modal from '../../components/Modal'

const MOODS = ['😞','😐','🙂','😄','🔥']
const DAYS = ['M','T','W','T','F','S','S']

export default function TrainerDashboard({ athletes, profile }) {
  const { toast } = useToast()
  const [journal, setJournal] = useState([])
  const [showCal, setShowCal] = useState(false)
  const [remindAth, setRemindAth] = useState(null)
  const [selDay, setSelDay] = useState(new Date().getDate())
  const [selMsg, setSelMsg] = useState(0)
  const [customMsg, setCustomMsg] = useState('')

  useEffect(() => { fetchTodayJournal() }, [])

  async function fetchTodayJournal() {
    const today = new Date().toISOString().split('T')[0]
    const { data } = await supabase
      .from('journal')
      .select('*, profiles!journal_athlete_id_fkey(name)')
      .eq('trainer_id', profile.id)
      .eq('date', today)
    setJournal(data || [])
  }

  function sendReminder() {
    toast({ message: `Reminder sent to ${remindAth.name} ✓` })
    setRemindAth(null)
    setCustomMsg('')
  }

  const avgStreak = athletes.length
    ? Math.round(athletes.reduce((s,a) => s+(a.streak_count||0),0)/athletes.length) : 0

  return (
    <div>
      {showCal && (
        <Modal title="Schedule" onClose={() => setShowCal(false)} maxWidth={480}>
          <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:4,marginBottom:6}}>
            {DAYS.map((d,i) => <div key={i} style={{textAlign:'center',fontSize:11,color:'var(--text3)',padding:'4px 0'}}>{d}</div>)}
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:4,marginBottom:16}}>
            {[...Array(31)].map((_,i) => {
              const d=i+1, isSel=d===selDay, isToday=d===new Date().getDate()
              return (
                <div key={i} onClick={()=>setSelDay(d)} style={{
                  aspectRatio:'1',borderRadius:6,display:'flex',alignItems:'center',justifyContent:'center',
                  fontSize:12,cursor:'pointer',
                  background:isSel?'var(--teal)':'transparent',
                  color:isSel?'#fff':'var(--text2)',
                  border:isToday&&!isSel?'1.5px solid var(--teal)':'none',
                  transition:'background 0.15s'
                }}>{d}</div>
              )
            })}
          </div>
          <div style={{borderTop:'0.5px solid var(--border)',paddingTop:12}}>
            <div style={{fontSize:13,fontWeight:500,color:'var(--text)',marginBottom:8}}>
              {selDay===new Date().getDate()?'Today':'Day '+selDay} · {journal.length} session{journal.length!==1?'s':''}
            </div>
            {journal.length===0
              ? <div style={{fontSize:13,color:'var(--text3)'}}>No sessions logged yet.</div>
              : journal.map((j,i)=>(
                <div key={i} style={{display:'flex',alignItems:'center',gap:10,padding:'7px 0',borderBottom:`0.5px solid var(--border)`}}>
                  <Avatar name={j.profiles?.name||'?'} size={28}/>
                  <div style={{flex:1,fontSize:13,color:'var(--text)'}}>{j.profiles?.name}</div>
                  <span style={{fontSize:14}}>{MOODS[(j.athlete_mood||3)-1]}</span>
                </div>
              ))
            }
          </div>
        </Modal>
      )}

      {remindAth && (
        <Modal title={`Remind · ${remindAth.name}`} onClose={()=>setRemindAth(null)}>
          {[
            `Hey ${remindAth.name.split(' ')[0]}, just a reminder about your session today! 💪`,
            `Hi ${remindAth.name.split(' ')[0]}, don't forget your workout — keep that streak going! 🔥`,
          ].map((msg,i)=>(
            <div key={i} onClick={()=>setSelMsg(i)} style={{
              padding:'10px 12px',borderRadius:8,marginBottom:8,cursor:'pointer',fontSize:13,
              border:`1.5px solid ${selMsg===i?'var(--teal)':'var(--border)'}`,
              background:selMsg===i?'var(--teal-light)':'var(--bg3)',color:'var(--text)',lineHeight:1.5
            }}>{msg}</div>
          ))}
          <div style={{marginBottom:12}}>
            <div style={{fontSize:12,color:'var(--text2)',marginBottom:4}}>Or write a custom message</div>
            <textarea value={customMsg} onChange={e=>setCustomMsg(e.target.value)}
              style={{width:'100%',padding:'8px 10px',borderRadius:8,border:'0.5px solid var(--border)',background:'var(--bg3)',color:'var(--text)',fontSize:13,outline:'none',resize:'none'}}
              rows={2} placeholder="Custom message..."/>
          </div>
          <div style={{display:'flex',justifyContent:'center',gap:10}}>
            <Btn variant="primary" onClick={sendReminder}>Send reminder</Btn>
            <Btn onClick={()=>setRemindAth(null)}>Cancel</Btn>
          </div>
        </Modal>
      )}

      <div style={{marginBottom:'1.5rem'}}>
        <div style={{fontSize:22,fontWeight:500,color:'var(--text)'}}>
          Good {new Date().getHours()<12?'morning':new Date().getHours()<17?'afternoon':'evening'}, {profile?.name} 👋
        </div>
        <div style={{fontSize:14,color:'var(--text2)',marginTop:2}}>
          {new Date().toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'})}
        </div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:14}}>
        <Metric label="Total athletes" value={athletes.length} color="var(--teal)"/>
        <Metric label="Sessions today" value={journal.length}/>
        <Metric label="Avg streak" value={`${avgStreak}d`} color="var(--amber)"/>
        <Metric label="Unpaid" value={athletes.filter(a=>!a.paid).length} color="#f07070"/>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
        <Card>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
            <STitle style={{marginBottom:0}}>Today's sessions</STitle>
            <button onClick={()=>setShowCal(true)} style={{
              background:'var(--teal-light)',border:'0.5px solid var(--teal-border)',
              borderRadius:8,padding:'5px 10px',cursor:'pointer',
              fontSize:13,color:'var(--teal-mid)',fontWeight:500,display:'flex',alignItems:'center',gap:5
            }}>📅 Calendar</button>
          </div>
          {journal.length===0
            ? <div style={{fontSize:13,color:'var(--text3)',padding:'1rem 0',textAlign:'center'}}>No sessions logged today yet.</div>
            : journal.map((j,i)=>(
              <div key={i} style={{display:'flex',alignItems:'center',gap:10,padding:'8px 0',borderBottom:i<journal.length-1?'0.5px solid var(--border)':'none'}}>
                <Avatar name={j.profiles?.name||'?'} size={28}/>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:500,color:'var(--text)'}}>{j.profiles?.name}</div>
                  <div style={{fontSize:11,color:'var(--text2)'}}>{j.note||'—'}</div>
                </div>
                <span style={{fontSize:14}}>{MOODS[(j.athlete_mood||3)-1]}</span>
                <Btn size="sm" onClick={()=>setRemindAth(athletes.find(a=>a.id===j.athlete_id)||{name:j.profiles?.name,id:j.athlete_id})}>Remind</Btn>
              </div>
            ))
          }
        </Card>

        <div style={{display:'flex',flexDirection:'column',gap:12}}>
          <Card>
            <STitle>Athletes overview</STitle>
            {athletes.length===0
              ? <div style={{fontSize:13,color:'var(--text3)'}}>No athletes yet. Add athletes from the Athletes tab.</div>
              : athletes.slice(0,5).map(a=>(
                <div key={a.id} style={{display:'flex',alignItems:'center',gap:10,padding:'8px 0',borderBottom:'0.5px solid var(--border)'}}>
                  <Avatar name={a.name} size={30}/>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,fontWeight:500,color:'var(--text)'}}>{a.name}</div>
                    <div style={{fontSize:11,color:'var(--text2)'}}>{a.plan||'No plan assigned'}</div>
                  </div>
                  <Badge variant="teal">{a.streak_count||0}d 🔥</Badge>
                </div>
              ))
            }
          </Card>
        </div>
      </div>
    </div>
  )
}