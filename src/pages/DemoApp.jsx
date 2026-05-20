import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sidebar } from '../components/Sidebar'
import { Card, Metric, Badge, Avatar, Divider, Toggle } from '../components/UI'

const TEAL = '#1D9E75'
const AMBER = '#EF9F27'
const MOODS = ['😞','😐','🙂','😄','🔥']
const MOOD_LABELS = ['Rough','Okay','Good','Great','On fire']

const athletes = [
  {id:'a1', name:'Sara Ahmadi',   age:28, height:165, streak_count:12, paid:true,  plan:'Strength A'},
  {id:'a2', name:'Dario Messi',   age:34, height:180, streak_count:3,  paid:false, plan:'Hypertrophy B'},
  {id:'a3', name:'Lena Karlsson', age:22, height:168, streak_count:7,  paid:true,  plan:'Endurance C'},
  {id:'a4', name:'Omar Farouk',   age:30, height:178, streak_count:0,  paid:true,  plan:'Strength A'},
  {id:'a5', name:'Nina Petrov',   age:26, height:162, streak_count:21, paid:true,  plan:'Hypertrophy B'},
]

const exercises = [
  {id:1, name:'Bench press',  type:'Strength', target_area:'Chest',     place:'Gym'},
  {id:2, name:'Squat',        type:'Strength', target_area:'Legs',      place:'Gym'},
  {id:3, name:'Pull-up',      type:'Strength', target_area:'Back',      place:'Gym'},
  {id:4, name:'Plank',        type:'Core',     target_area:'Abs',       place:'Any'},
  {id:5, name:'Running',      type:'Cardio',   target_area:'Full body', place:'Outdoor'},
]

const planExs = [
  {id:1, name:'Bench press',  sets:4, reps:8,     weight:'80kg',  day:'Monday'},
  {id:2, name:'Incline press',sets:3, reps:10,    weight:'60kg',  day:'Monday'},
  {id:3, name:'Squat',        sets:5, reps:5,     weight:'100kg', day:'Wednesday'},
  {id:4, name:'Leg press',    sets:3, reps:12,    weight:'150kg', day:'Wednesday'},
  {id:5, name:'Pull-up',      sets:3, reps:'max', weight:'BW',    day:'Friday'},
  {id:6, name:'Barbell row',  sets:4, reps:8,     weight:'70kg',  day:'Friday'},
]

const journal = [
  {date:'May 16', ex:'Bench press', sets:4, reps:8,  weight:100, mood:4, note:'Felt strong'},
  {date:'May 14', ex:'Squat',       sets:5, reps:5,  weight:120, mood:3, note:'Knees a bit stiff'},
  {date:'May 12', ex:'Pull-up',     sets:3, reps:10, weight:null,mood:5, note:'New PR!'},
  {date:'May 10', ex:'Plank',       sets:3, reps:60, weight:null,mood:4, note:''},
]

const bodyData = [
  {date:'Apr 1',  weight:65, waist:72, muscle:28},
  {date:'Apr 15', weight:64, waist:71, muscle:29},
  {date:'May 1',  weight:63, waist:70, muscle:30},
  {date:'May 15', weight:62, waist:69, muscle:31},
]

const strengthData = {
  'Bench press': [{date:'Jan',val:70},{date:'Feb',val:75},{date:'Mar',val:82},{date:'Apr',val:90},{date:'May',val:100}],
  'Squat':       [{date:'Jan',val:80},{date:'Feb',val:88},{date:'Mar',val:100},{date:'Apr',val:112},{date:'May',val:125}],
  'Pull-up':     [{date:'Jan',val:6}, {date:'Feb',val:7}, {date:'Mar',val:9}, {date:'Apr',val:10},{date:'May',val:12}],
}

const badges = [
  {icon:'⭐', label:'First session', earned:true},
  {icon:'🔥', label:'7-day streak',  earned:true},
  {icon:'🏆', label:'First PR',      earned:true},
  {icon:'💪', label:'10 sessions',   earned:true},
  {icon:'🎯', label:'25 sessions',   earned:false},
  {icon:'🌟', label:'30-day streak', earned:false},
]

const financeAll = [
  {name:'Sara Ahmadi',   amount:300, currency:'EUR', paid:true,  note:'Monthly May'},
  {name:'Dario Messi',   amount:300, currency:'EUR', paid:false, note:'Monthly May'},
  {name:'Lena Karlsson', amount:300, currency:'EUR', paid:true,  note:'Monthly May'},
  {name:'Omar Farouk',   amount:300, currency:'EUR', paid:true,  note:'Monthly May'},
  {name:'Nina Petrov',   amount:300, currency:'EUR', paid:true,  note:'Monthly May'},
]

function LineChart({data, lines, height=160}) {
  const pad={top:16,right:16,bottom:28,left:36}
  const W=380, H=height, iW=W-pad.left-pad.right, iH=H-pad.top-pad.bottom
  const allV=lines.flatMap(l=>data.map(d=>d[l.key]))
  const minV=Math.min(...allV), maxV=Math.max(...allV), range=maxV-minV||1
  const x=i=>pad.left+(i/(data.length-1))*iW
  const y=v=>pad.top+(1-(v-minV)/range)*iH
  const path=k=>data.map((d,i)=>`${i===0?'M':'L'}${x(i).toFixed(1)},${y(d[k]).toFixed(1)}`).join(' ')
  const ticks=[minV, Math.round((minV+maxV)/2), maxV]
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{overflow:'visible'}}>
      {ticks.map((t,i)=>(
        <g key={i}>
          <line x1={pad.left} x2={W-pad.right} y1={y(t)} y2={y(t)} stroke="var(--border)" strokeWidth="0.5"/>
          <text x={pad.left-6} y={y(t)+4} textAnchor="end" fontSize="10" fill="var(--text3)">{t}</text>
        </g>
      ))}
      {data.map((d,i)=><text key={i} x={x(i)} y={H-6} textAnchor="middle" fontSize="10" fill="var(--text3)">{d.date}</text>)}
      {lines.map(l=>(
        <g key={l.key}>
          <path d={path(l.key)} fill="none" stroke={l.color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"/>
          {data.map((d,i)=><circle key={i} cx={x(i)} cy={y(d[l.key])} r="4" fill={l.color} stroke="var(--bg2)" strokeWidth="1.5"/>)}
        </g>
      ))}
    </svg>
  )
}

function STitle({children, style={}}) {
  return <div style={{fontSize:14, fontWeight:500, color:'var(--text)', marginBottom:'0.75rem', ...style}}>{children}</div>
}

function Btn({variant='ghost', size='md', onClick, children, style={}}) {
  const base={border:'none',borderRadius:8,fontWeight:500,cursor:'pointer',display:'inline-flex',alignItems:'center',gap:6,transition:'opacity 0.15s'}
  const sizes={sm:{padding:'4px 10px',fontSize:12}, md:{padding:'7px 14px',fontSize:13}}
  const variants={
    primary:  {background:TEAL, color:'#fff'},
    secondary:{background:'transparent', border:`1.5px solid ${TEAL}`, color:TEAL},
    ghost:    {background:'var(--bg3)', color:'var(--text)', border:'0.5px solid var(--border)'},
    danger:   {background:'#3d1212', color:'#f07070', border:'none'},
  }
  return <button style={{...base,...sizes[size],...(variants[variant]||variants.ghost),...style}} onClick={onClick}>{children}</button>
}

function Modal({title, onClose, children, maxWidth=420}) {
  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.6)',zIndex:300,display:'flex',alignItems:'center',justifyContent:'center',padding:'1rem'}} onClick={onClose}>
      <div style={{background:'var(--bg2)',border:'0.5px solid var(--border)',borderRadius:16,padding:'1.5rem',width:'100%',maxWidth,boxShadow:'0 8px 32px rgba(0,0,0,0.3)',maxHeight:'90vh',overflowY:'auto'}} onClick={e=>e.stopPropagation()}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
          <div style={{fontSize:16,fontWeight:500,color:'var(--text)'}}>{title}</div>
          <Btn size="sm" onClick={onClose}>✕</Btn>
        </div>
        {children}
      </div>
    </div>
  )
}

// ── Trainer Pages ─────────────────────────────────────────────────────────────
function TDashboard() {
  const [showCal, setShowCal] = useState(false)
  const [selDay, setSelDay] = useState(17)
  const sessionDays=[1,3,5,8,10,12,15,17,19,22,24]
  const days=['M','T','W','T','F','S','S']
  const todaySessions=[{t:'09:00',n:'Sara Ahmadi'},{t:'10:30',n:'Lena Karlsson'},{t:'12:00',n:'Omar Farouk'},{t:'14:00',n:'Dario Messi'},{t:'16:00',n:'Nina Petrov'}]
  return (
    <div>
      {showCal && (
        <Modal title="May 2026 · Schedule" onClose={()=>setShowCal(false)} maxWidth={480}>
          <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:4,marginBottom:6}}>
            {days.map((d,i)=><div key={i} style={{textAlign:'center',fontSize:11,color:'var(--text3)',padding:'4px 0'}}>{d}</div>)}
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:4,marginBottom:16}}>
            {[...Array(31)].map((_,i)=>{
              const d=i+1, isSel=d===selDay, isToday=d===17, has=sessionDays.includes(d)
              return <div key={i} onClick={()=>setSelDay(d)} style={{aspectRatio:'1',borderRadius:6,display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,cursor:'pointer',background:isSel?TEAL:has?'var(--teal-light)':'transparent',color:isSel?'#fff':has?'var(--teal-mid)':'var(--text2)',border:isToday&&!isSel?`1.5px solid ${TEAL}`:'none'}}>{d}</div>
            })}
          </div>
          <div style={{borderTop:'0.5px solid var(--border)',paddingTop:12}}>
            <div style={{fontSize:13,fontWeight:500,color:'var(--text)',marginBottom:8}}>{selDay===17?'Today':'May '+selDay} · {selDay===17?'5 sessions':'No sessions'}</div>
            {selDay===17&&todaySessions.map((s,i)=>(
              <div key={i} style={{display:'flex',alignItems:'center',gap:10,padding:'7px 0',borderBottom:'0.5px solid var(--border)'}}>
                <div style={{fontSize:12,color:'var(--text3)',width:40}}>{s.t}</div>
                <Avatar name={s.n} size={28}/>
                <div style={{fontSize:13,color:'var(--text)',flex:1}}>{s.n}</div>
              </div>
            ))}
          </div>
        </Modal>
      )}
      <div style={{marginBottom:'1.5rem'}}>
        <div style={{fontSize:22,fontWeight:500,color:'var(--text)'}}>Good morning, Coach Maryam 👋</div>
        <div style={{fontSize:14,color:'var(--text2)',marginTop:2}}>Sunday, May 17 · 5 sessions today</div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:14}}>
        <Metric label="Total athletes" value={athletes.length} color={TEAL}/>
        <Metric label="Sessions today" value="5"/>
        <Metric label="Avg streak" value="8d" color={AMBER}/>
        <Metric label="Unpaid" value="1" color="#f07070"/>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
        <Card>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
            <STitle style={{marginBottom:0}}>Today's sessions</STitle>
            <button onClick={()=>setShowCal(true)} style={{background:'var(--teal-light)',border:'0.5px solid var(--teal-border)',borderRadius:8,padding:'5px 10px',cursor:'pointer',fontSize:13,color:'var(--teal-mid)',fontWeight:500}}>📅 Calendar</button>
          </div>
          {athletes.map((a,i)=>(
            <div key={a.id} style={{display:'flex',alignItems:'center',gap:10,padding:'8px 0',borderBottom:i<athletes.length-1?'0.5px solid var(--border)':'none'}}>
              <Avatar name={a.name} size={28}/>
              <div style={{flex:1}}><div style={{fontSize:13,fontWeight:500,color:'var(--text)'}}>{a.name}</div><div style={{fontSize:11,color:'var(--text2)'}}>{exercises[i%exercises.length].name}</div></div>
              <Btn size="sm">Remind</Btn>
            </div>
          ))}
        </Card>
        <div style={{display:'flex',flexDirection:'column',gap:12}}>
          <Card>
            <STitle>Athletes overview</STitle>
            {athletes.slice(0,4).map(a=>(
              <div key={a.id} style={{display:'flex',alignItems:'center',gap:10,padding:'8px 0',borderBottom:'0.5px solid var(--border)'}}>
                <Avatar name={a.name} size={30}/>
                <div style={{flex:1}}><div style={{fontSize:13,fontWeight:500,color:'var(--text)'}}>{a.name}</div><div style={{fontSize:11,color:'var(--text2)'}}>{a.plan}</div></div>
                <Badge variant="teal">{a.streak_count}d🔥</Badge>
                {!a.paid&&<Badge variant="red">Due</Badge>}
              </div>
            ))}
          </Card>
          <Card>
            <STitle>Mood summary · this week</STitle>
            <div style={{display:'flex',gap:8}}>{MOODS.map((m,i)=><div key={i} style={{textAlign:'center',flex:1}}><div style={{fontSize:18}}>{m}</div><div style={{fontSize:11,color:'var(--text2)',marginTop:2}}>{[2,5,8,3,2][i]}</div></div>)}</div>
          </Card>
        </div>
      </div>
    </div>
  )
}

function TAthletes() {
  const [sel, setSel] = useState(null)
  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'1.5rem',flexWrap:'wrap',gap:8}}>
        <div><div style={{fontSize:22,fontWeight:500,color:'var(--text)'}}>Athletes</div><div style={{fontSize:14,color:'var(--text2)',marginTop:2}}>{athletes.length} athletes in your roster</div></div>
        <Btn variant="primary">＋ Add athlete</Btn>
      </div>
      <Card>
        {athletes.map(a=>(
          <div key={a.id}>
            <div onClick={()=>setSel(sel===a.id?null:a.id)} style={{display:'flex',alignItems:'center',gap:10,padding:'10px 0',borderBottom:'0.5px solid var(--border)',cursor:'pointer'}}>
              <Avatar name={a.name} size={36}/>
              <div style={{flex:1}}><div style={{fontSize:14,fontWeight:500,color:'var(--text)'}}>{a.name}</div><div style={{fontSize:12,color:'var(--text2)'}}>Age {a.age} · {a.plan}</div></div>
              <Badge variant="teal">{a.streak_count}d🔥</Badge>
              {!a.paid&&<Badge variant="red">Unpaid</Badge>}
              <span style={{fontSize:11,color:'var(--text3)'}}>{sel===a.id?'▲':'▼'}</span>
            </div>
            {sel===a.id&&(
              <div style={{padding:'12px 0 8px'}}>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10,marginBottom:10}}>
                  <Metric label="Streak" value={`${a.streak_count}d`} color={AMBER}/>
                  <Metric label="Height" value={`${a.height}cm`}/>
                  <Metric label="Age" value={a.age}/>
                </div>
                <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                  <Btn variant="primary" size="sm">Log session</Btn>
                  <Btn variant="secondary" size="sm">Edit plan</Btn>
                  <Btn size="sm">Body metrics</Btn>
                </div>
              </div>
            )}
          </div>
        ))}
      </Card>
    </div>
  )
}

function TExercises() {
  const [list, setList] = useState(exercises)
  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'1.5rem',flexWrap:'wrap',gap:8}}>
        <div><div style={{fontSize:22,fontWeight:500,color:'var(--text)'}}>Exercise library</div><div style={{fontSize:14,color:'var(--text2)',marginTop:2}}>Filter bar coming soon</div></div>
        <Btn variant="primary">＋ New exercise</Btn>
      </div>
      <Card>
        <div style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr auto',gap:8,paddingBottom:8,borderBottom:'0.5px solid var(--border)',marginBottom:4}}>
          {['Exercise','Type','Target','Place',''].map((h,i)=><div key={i} style={{fontSize:11,color:'var(--text3)',fontWeight:500,textTransform:'uppercase',letterSpacing:'0.06em'}}>{h}</div>)}
        </div>
        {list.map(e=>(
          <div key={e.id} style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr auto',gap:8,padding:'10px 0',borderBottom:'0.5px solid var(--border)',alignItems:'center'}}>
            <div style={{fontSize:14,fontWeight:500,color:'var(--text)'}}>{e.name}</div>
            <Badge variant="gray">{e.type}</Badge>
            <Badge variant="gray">{e.target_area}</Badge>
            <Badge variant="gray">{e.place}</Badge>
            <div style={{display:'flex',gap:6}}>
              <Btn size="sm">Edit</Btn>
              <Btn size="sm" variant="danger" onClick={()=>setList(list.filter(x=>x.id!==e.id))}>Del</Btn>
            </div>
          </div>
        ))}
      </Card>
    </div>
  )
}

function TPlans() {
  const [sel, setSel] = useState('Sara Ahmadi')
  const [showLog, setShowLog] = useState(false)
  const [mood, setMood] = useState(2)
  const [done, setDone] = useState({})
  const byDay = planExs.reduce((acc,ex)=>{if(!acc[ex.day])acc[ex.day]=[];acc[ex.day].push(ex);return acc},{})
  return (
    <div>
      {showLog&&(
        <Modal title={`Log session · ${sel}`} onClose={()=>setShowLog(false)} maxWidth={460}>
          <div style={{display:'flex',flexDirection:'column',gap:10}}>
            {planExs.map(ex=>(
              <div key={ex.id} style={{background:'var(--bg3)',borderRadius:10,padding:'10px 12px',border:`0.5px solid ${done[ex.id]?TEAL:'var(--border)'}`,transition:'border 0.15s'}}>
                <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:done[ex.id]?10:0}}>
                  <input type="checkbox" checked={!!done[ex.id]} onChange={e=>setDone(p=>({...p,[ex.id]:e.target.checked}))} style={{accentColor:TEAL,width:16,height:16,cursor:'pointer'}}/>
                  <div style={{flex:1}}><div style={{fontSize:13,fontWeight:500,color:'var(--text)'}}>{ex.name}</div><div style={{fontSize:11,color:'var(--text2)'}}>Plan: {ex.sets} sets · {ex.reps} reps · {ex.weight}</div></div>
                </div>
                {done[ex.id]&&(
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8,paddingLeft:26}}>
                    {[['Sets',ex.sets],['Reps',ex.reps],['kg','']].map(([l,ph])=>(
                      <div key={l}><div style={{fontSize:11,color:'var(--text2)',marginBottom:3}}>{l}</div><input type="number" placeholder={String(ph)} style={{width:'100%',padding:'6px 8px',borderRadius:7,border:'0.5px solid var(--border)',background:'var(--bg2)',color:'var(--text)',fontSize:12,outline:'none'}}/></div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div>
              <div style={{fontSize:12,color:'var(--text2)',marginBottom:6}}>Athlete mood today</div>
              <div style={{display:'flex',gap:6}}>{MOODS.map((m,i)=><button key={i} onClick={()=>setMood(i)} style={{border:`0.5px solid ${mood===i?TEAL:'var(--border)'}`,borderRadius:8,padding:'6px 10px',fontSize:18,cursor:'pointer',background:mood===i?'var(--teal-light)':'var(--bg3)'}}>{m}</button>)}</div>
              <div style={{fontSize:11,color:'var(--teal-mid)',marginTop:4}}>{MOOD_LABELS[mood]}</div>
            </div>
            <input placeholder="Notes (optional)" style={{width:'100%',padding:'8px 10px',borderRadius:8,border:'0.5px solid var(--border)',background:'var(--bg3)',color:'var(--text)',fontSize:13,outline:'none'}}/>
            <div style={{display:'flex',justifyContent:'center',gap:10,marginTop:4}}>
              <Btn variant="primary" onClick={()=>setShowLog(false)}>Save session</Btn>
              <Btn onClick={()=>setShowLog(false)}>Cancel</Btn>
            </div>
          </div>
        </Modal>
      )}
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'1.5rem',flexWrap:'wrap',gap:8}}>
        <div><div style={{fontSize:22,fontWeight:500,color:'var(--text)'}}>Plans</div><div style={{fontSize:14,color:'var(--text2)',marginTop:2}}>Build and assign workout plans</div></div>
        <Btn variant="primary">＋ New plan</Btn>
      </div>
      <div style={{display:'flex',gap:12,alignItems:'flex-start'}}>
        <div style={{width:150,background:'var(--bg2)',border:'0.5px solid var(--border)',borderRadius:12,padding:'0.75rem',flexShrink:0}}>
          <div style={{fontSize:11,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:8}}>Athletes</div>
          {athletes.map(a=>(
            <div key={a.id} onClick={()=>setSel(a.name)} style={{display:'flex',alignItems:'center',gap:7,padding:'6px 8px',borderRadius:7,cursor:'pointer',background:sel===a.name?'var(--teal-light)':'transparent',marginBottom:2}}>
              <Avatar name={a.name} size={24}/>
              <div style={{fontSize:12,fontWeight:sel===a.name?500:400,color:sel===a.name?'var(--teal-mid)':'var(--text2)',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{a.name.split(' ')[0]}</div>
            </div>
          ))}
        </div>
        <div style={{flex:1}}>
          <Card>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12,flexWrap:'wrap',gap:8}}>
              <div style={{fontSize:15,fontWeight:500,color:'var(--text)'}}>{sel} · Strength A</div>
              <div style={{display:'flex',gap:8}}><Btn size="sm">Edit plan</Btn><Btn size="sm" variant="danger">Delete plan</Btn></div>
            </div>
            {Object.entries(byDay).map(([day,exs])=>(
              <div key={day} style={{marginBottom:10}}>
                <div style={{fontSize:12,color:'var(--text2)',fontWeight:500,marginBottom:6,paddingTop:4}}>{day}</div>
                {exs.map((p,i)=>(
                  <div key={p.id} style={{display:'flex',alignItems:'center',gap:10,padding:'8px 0',borderBottom:'0.5px solid var(--border)'}}>
                    <div style={{width:22,height:22,borderRadius:6,background:'var(--teal-light)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,color:'var(--teal-mid)',fontWeight:500}}>{i+1}</div>
                    <div style={{flex:1}}><div style={{fontSize:13,fontWeight:500,color:'var(--text)'}}>{p.name}</div><div style={{fontSize:11,color:'var(--text2)'}}>{p.sets} sets · {p.reps} reps · {p.weight}</div></div>
                    <Btn size="sm">Edit</Btn>
                    <Btn size="sm" variant="danger">Del</Btn>
                  </div>
                ))}
              </div>
            ))}
            <div style={{marginTop:12,display:'flex',gap:8}}>
              <Btn variant="secondary" size="sm">＋ Add exercise</Btn>
              <Btn variant="primary" size="sm" onClick={()=>setShowLog(true)}>Log session</Btn>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

function TFinance() {
  const total = financeAll.filter(r=>r.paid).reduce((s,r)=>s+r.amount,0)
  return (
    <div>
      <div style={{fontSize:22,fontWeight:500,color:'var(--text)',marginBottom:2}}>Finance</div>
      <div style={{fontSize:14,color:'var(--text2)',marginBottom:'1.5rem'}}>Payment tracking across all athletes</div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12,marginBottom:14}}>
        <Metric label="Collected" value={`€${total}`} color={TEAL}/>
        <Metric label="Unpaid" value="1" color="#f07070"/>
        <Metric label="Total records" value={financeAll.length}/>
      </div>
      <Card>
        {financeAll.map((r,i)=>(
          <div key={i} style={{display:'flex',alignItems:'center',gap:10,padding:'10px 0',borderBottom:'0.5px solid var(--border)'}}>
            <Avatar name={r.name} size={34}/>
            <div style={{flex:1}}><div style={{fontSize:13,fontWeight:500,color:'var(--text)'}}>{r.name}</div><div style={{fontSize:11,color:'var(--text2)'}}>EUR {r.amount} · {r.note}</div></div>
            {r.paid?<Badge variant="teal">✓ Paid</Badge>:<><Badge variant="red">Unpaid</Badge><Btn size="sm" style={{marginLeft:6}}>Remind</Btn></>}
          </div>
        ))}
      </Card>
    </div>
  )
}

// ── Athlete Pages ─────────────────────────────────────────────────────────────
function ADashboard() {
  const prs=[{ex:'Bench press',val:'100kg',date:'May 12'},{ex:'Pull-up',val:'12 reps',date:'May 8'},{ex:'Squat',val:'125kg',date:'Apr 30'}]
  return (
    <div>
      <div style={{fontSize:22,fontWeight:500,color:'var(--text)'}}>Hey Sara 👋</div>
      <div style={{fontSize:14,color:'var(--text2)',marginTop:2,marginBottom:'1.5rem'}}>Sunday, May 17 · Keep the streak alive!</div>
      <Card style={{marginBottom:14,borderLeft:`3px solid ${AMBER}`}}>
        <STitle>🏆 Your latest PRs</STitle>
        <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
          {prs.map((pr,i)=>(
            <div key={i} style={{flex:1,minWidth:90,background:'var(--amber-light)',borderRadius:8,padding:'8px 12px'}}>
              <div style={{fontSize:12,color:'var(--amber-dark)',marginBottom:2}}>{pr.ex}</div>
              <div style={{fontSize:18,fontWeight:500,color:AMBER}}>{pr.val}</div>
              <div style={{fontSize:11,color:'var(--text3)',marginTop:2}}>{pr.date}</div>
            </div>
          ))}
        </div>
      </Card>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12,marginBottom:14}}>
        <Metric label="Sessions" value={journal.length} color={TEAL}/>
        <div style={{background:'var(--teal-light)',border:'0.5px solid var(--teal-border)',borderRadius:12,padding:'1rem 1.25rem'}}>
          <div style={{fontSize:11,color:'var(--teal-mid)',marginBottom:2}}>🔥 Streak</div>
          <div style={{fontSize:24,fontWeight:500,color:'var(--teal-deep)'}}>12</div>
          <div style={{fontSize:11,color:'var(--teal-mid)'}}>days</div>
        </div>
        <Metric label="PRs this month" value="3" color={AMBER}/>
      </div>
      <Card>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
          <STitle style={{marginBottom:0}}>Today's session</STitle>
          <Badge variant="teal">Strength A</Badge>
        </div>
        {planExs.filter(ex=>ex.day==='Monday').map((s,i)=>(
          <div key={s.id} style={{display:'flex',alignItems:'center',gap:10,padding:'8px 0',borderBottom:i<1?'0.5px solid var(--border)':'none'}}>
            <div style={{width:22,height:22,borderRadius:6,background:'var(--teal-light)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,color:'var(--teal-mid)',fontWeight:500}}>{i+1}</div>
            <div style={{flex:1}}><div style={{fontSize:13,fontWeight:500,color:'var(--text)'}}>{s.name}</div><div style={{fontSize:11,color:'var(--text2)'}}>{s.sets} sets · {s.reps} · {s.weight}</div></div>
          </div>
        ))}
      </Card>
    </div>
  )
}

function AMyPlan() {
  const byDay=planExs.reduce((acc,ex)=>{if(!acc[ex.day])acc[ex.day]=[];acc[ex.day].push(ex);return acc},{})
  return (
    <div>
      <div style={{fontSize:22,fontWeight:500,color:'var(--text)'}}>My plan</div>
      <div style={{fontSize:14,color:'var(--text2)',marginTop:2,marginBottom:'1.5rem'}}>Assigned by Coach Maryam · Strength A</div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
        <div>
          {Object.entries(byDay).map(([day,exs])=>(
            <Card key={day} style={{marginBottom:12}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
                <div style={{fontSize:14,fontWeight:500,color:'var(--text)'}}>{day}</div>
                <Badge variant="teal">{exs.length} exercises</Badge>
              </div>
              {exs.map((e,j)=>(
                <div key={e.id} style={{display:'flex',alignItems:'center',gap:10,padding:'7px 0',borderBottom:j<exs.length-1?'0.5px solid var(--border)':'none'}}>
                  <div style={{width:20,height:20,borderRadius:5,background:'var(--teal-light)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,color:'var(--teal-mid)',fontWeight:500}}>{j+1}</div>
                  <div style={{flex:1,fontSize:13,color:'var(--text)'}}>{e.name}</div>
                  <div style={{fontSize:11,color:'var(--text2)'}}>{e.sets}×{e.reps} · {e.weight}</div>
                </div>
              ))}
            </Card>
          ))}
        </div>
        <Card>
          <STitle>Session history</STitle>
          {journal.map((j,i)=>(
            <div key={i} style={{padding:'9px 0',borderBottom:'0.5px solid var(--border)'}}>
              <div style={{display:'flex',justifyContent:'space-between'}}><div style={{fontSize:13,fontWeight:500,color:'var(--text)'}}>{j.ex}</div><span style={{fontSize:11,color:'var(--text3)'}}>{j.date}</span></div>
              <div style={{fontSize:11,color:'var(--text2)',marginTop:2}}>{j.sets} sets · {j.reps} reps{j.weight?` · ${j.weight}kg`:''} · {MOODS[j.mood-1]}</div>
              {j.note&&<div style={{fontSize:11,color:'var(--teal-mid)',marginTop:2,fontStyle:'italic'}}>{j.note}</div>}
            </div>
          ))}
        </Card>
      </div>
    </div>
  )
}

function AProgress() {
  const [activeEx, setActiveEx] = useState('Bench press')
  const exData = strengthData[activeEx]
  return (
    <div>
      <div style={{fontSize:22,fontWeight:500,color:'var(--text)'}}>Progress</div>
      <div style={{fontSize:14,color:'var(--text2)',marginTop:2,marginBottom:'1.5rem'}}>Your body metrics and strength over time</div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:14}}>
        <Card>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
            <STitle style={{marginBottom:0}}>Body weight <span style={{fontWeight:400,color:'var(--text3)',fontSize:12}}>kg</span></STitle>
            <Badge variant="teal">↓ −3kg since Apr</Badge>
          </div>
          <LineChart data={bodyData} lines={[{key:'weight',color:TEAL}]} height={150}/>
        </Card>
        <Card>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
            <STitle style={{marginBottom:0}}>Muscle mass <span style={{fontWeight:400,color:'var(--text3)',fontSize:12}}>%</span></STitle>
            <Badge variant="amber">↑ +3% since Apr</Badge>
          </div>
          <LineChart data={bodyData} lines={[{key:'muscle',color:AMBER}]} height={150}/>
        </Card>
      </div>
      <Card>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12,flexWrap:'wrap',gap:8}}>
          <STitle style={{marginBottom:0}}>Strength progress</STitle>
          <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
            {Object.keys(strengthData).map(ex=>(
              <button key={ex} onClick={()=>setActiveEx(ex)} style={{padding:'4px 10px',borderRadius:6,border:`0.5px solid ${activeEx===ex?TEAL:'var(--border)'}`,background:activeEx===ex?'var(--teal-light)':'transparent',color:activeEx===ex?'var(--teal-mid)':'var(--text2)',fontSize:12,cursor:'pointer',fontWeight:activeEx===ex?500:400}}>{ex}</button>
            ))}
          </div>
        </div>
        <div style={{display:'flex',justifyContent:'space-between',marginBottom:8,flexWrap:'wrap',gap:6}}>
          <div style={{fontSize:12,color:'var(--text2)'}}>Started: <strong style={{color:'var(--text)'}}>{exData[0].val}{activeEx==='Pull-up'?' reps':'kg'}</strong> · PR: <strong style={{color:AMBER}}>{exData[exData.length-1].val}{activeEx==='Pull-up'?' reps':'kg'}</strong></div>
          <Badge variant="amber">🏆 +{exData[exData.length-1].val-exData[0].val}{activeEx==='Pull-up'?' reps':'kg'}</Badge>
        </div>
        <LineChart data={exData} lines={[{key:'val',color:TEAL}]} height={180}/>
      </Card>
    </div>
  )
}

function AAchievements() {
  return (
    <div>
      <div style={{fontSize:22,fontWeight:500,color:'var(--text)'}}>Achievements</div>
      <div style={{fontSize:14,color:'var(--text2)',marginTop:2,marginBottom:'1.5rem'}}>Your badges, milestones and personal records</div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
        <div>
          <Card style={{marginBottom:12}}>
            <STitle>Badges</STitle>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
              {badges.map((b,i)=>(
                <div key={i} style={{display:'flex',alignItems:'center',gap:10,padding:'8px 10px',background:b.earned?'var(--teal-light)':'var(--bg3)',borderRadius:8,border:`0.5px solid ${b.earned?'var(--teal-border)':'var(--border)'}`,opacity:b.earned?1:0.5}}>
                  <div style={{fontSize:22}}>{b.earned?b.icon:'🔒'}</div>
                  <div style={{fontSize:12,fontWeight:500,color:b.earned?'var(--teal-mid)':'var(--text3)'}}>{b.label}</div>
                </div>
              ))}
            </div>
          </Card>
          <div style={{background:'var(--teal-light)',border:'0.5px solid var(--teal-border)',borderRadius:12,padding:'1rem 1.25rem'}}>
            <div style={{fontSize:12,color:'var(--teal-mid)',marginBottom:4}}>🔥 Current streak</div>
            <div style={{fontSize:36,fontWeight:500,color:'var(--teal-deep)'}}>12</div>
            <div style={{fontSize:12,color:'var(--teal-mid)'}}>days in a row · Best: 21 days</div>
          </div>
        </div>
        <Card>
          <STitle>Milestones</STitle>
          {[{label:'First session',date:'Jan 5, 2026',done:true},{label:'10 sessions',date:'Feb 12, 2026',done:true},{label:'First PR',date:'Feb 28, 2026',done:true},{label:'7-day streak',date:'Mar 10, 2026',done:true},{label:'25 sessions',date:'In progress',done:false},{label:'30-day streak',date:'Not started',done:false}].map((m,i)=>(
            <div key={i} style={{display:'flex',alignItems:'center',gap:10,padding:'9px 0',borderBottom:'0.5px solid var(--border)'}}>
              <div style={{width:24,height:24,borderRadius:'50%',background:m.done?TEAL:'var(--bg3)',border:`0.5px solid ${m.done?TEAL:'var(--border)'}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,color:'#fff',flexShrink:0}}>{m.done?'✓':''}</div>
              <div style={{flex:1}}><div style={{fontSize:13,fontWeight:500,color:m.done?'var(--text)':'var(--text2)'}}>{m.label}</div><div style={{fontSize:11,color:'var(--text3)'}}>{m.date}</div></div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  )
}

function AProfile({darkMode, setDarkMode}) {
  const [memberOpen, setMemberOpen] = useState(false)
  return (
    <div>
      <div style={{fontSize:22,fontWeight:500,color:'var(--text)'}}>Profile</div>
      <div style={{fontSize:14,color:'var(--text2)',marginTop:2,marginBottom:'1.5rem'}}>Your personal info and account</div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
        <Card>
          <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:16}}>
            <Avatar name="Sara Ahmadi" size={56}/>
            <div><div style={{fontSize:17,fontWeight:500,color:'var(--text)'}}>Sara Ahmadi</div><div style={{fontSize:13,color:'var(--text2)'}}>Athlete · Coach Maryam</div></div>
          </div>
          <Divider/>
          <div style={{display:'flex',flexDirection:'column',gap:10,marginBottom:16}}>
            {[['Age','28'],['Height','165 cm'],['Language','English']].map(([k,v])=>(
              <div key={k} style={{display:'flex',justifyContent:'space-between'}}><div style={{fontSize:12,color:'var(--text2)'}}>{k}</div><div style={{fontSize:13,color:'var(--text)'}}>{v}</div></div>
            ))}
          </div>
          <Divider/>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
            <div><div style={{fontSize:13,color:'var(--text)'}}>Dark mode</div><div style={{fontSize:11,color:'var(--text3)',marginTop:1}}>Switch appearance</div></div>
            <Toggle on={darkMode} onToggle={()=>setDarkMode(!darkMode)}/>
          </div>
          <div onClick={()=>setMemberOpen(!memberOpen)} style={{display:'flex',justifyContent:'space-between',alignItems:'center',cursor:'pointer',padding:'8px 10px',background:'var(--bg3)',borderRadius:8,marginBottom:12}}>
            <div style={{display:'flex',alignItems:'center',gap:8}}><div style={{width:8,height:8,borderRadius:'50%',background:TEAL}}/><span style={{fontSize:13,color:'var(--text2)'}}>Membership · <span style={{color:TEAL,fontWeight:500}}>Active</span></span></div>
            <span style={{fontSize:11,color:'var(--text3)'}}>{memberOpen?'▲':'▼'}</span>
          </div>
          {memberOpen&&(
            <div style={{padding:'10px 12px',background:'var(--bg3)',borderRadius:8,marginBottom:12}}>
              {[['Plan','Monthly · €300'],['Renewal','June 1, 2026'],['Trainer','Coach Maryam'],['Since','January 2026']].map(([k,v])=>(
                <div key={k} style={{display:'flex',justifyContent:'space-between',padding:'4px 0'}}><span style={{fontSize:12,color:'var(--text2)'}}>{k}</span><span style={{fontSize:12,color:'var(--text)'}}>{v}</span></div>
              ))}
            </div>
          )}
          <Btn style={{width:'100%',justifyContent:'center'}}>Edit profile</Btn>
        </Card>
        <Card>
          <STitle>Recent activity</STitle>
          {journal.map((j,i)=>(
            <div key={i} style={{display:'flex',alignItems:'center',gap:10,padding:'8px 0',borderBottom:'0.5px solid var(--border)'}}>
              <div style={{fontSize:11,color:'var(--text3)',width:52}}>{j.date}</div>
              <div style={{flex:1,fontSize:13,color:'var(--text)'}}>{j.ex}</div>
              <span style={{fontSize:14}}>{MOODS[j.mood-1]}</span>
            </div>
          ))}
        </Card>
      </div>
    </div>
  )
}

// ── Main DemoApp ──────────────────────────────────────────────────────────────
export default function DemoApp() {
  const navigate = useNavigate()
  const [role, setRole] = useState('trainer')
  const [page, setPage] = useState('dashboard')
  const [darkMode, setDarkMode] = useState(false)
  const [sideOpen, setSideOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(()=>{
    const fn=()=>setIsMobile(window.innerWidth<768)
    window.addEventListener('resize',fn)
    return()=>window.removeEventListener('resize',fn)
  },[])

  useEffect(()=>{
    document.documentElement.setAttribute('data-theme', darkMode?'dark':'light')
  },[darkMode])

  const trainerNav=[{id:'dashboard',label:'Dashboard',icon:'🏠'},{id:'athletes',label:'Athletes',icon:'👥'},{id:'exercises',label:'Exercises',icon:'🏋️'},{id:'plans',label:'Plans',icon:'📋'},{id:'finance',label:'Finance',icon:'💳'}]
  const athleteNav=[{id:'profile',label:'Profile',icon:'👤'},{id:'dashboard',label:'Dashboard',icon:'🏠'},{id:'myplan',label:'My plan',icon:'📋'},{id:'progress',label:'Progress',icon:'📈'},{id:'achievements',label:'Achievements',icon:'🏆'}]
  const nav = role==='trainer' ? trainerNav : athleteNav

  const trainerPages={dashboard:<TDashboard/>,athletes:<TAthletes/>,exercises:<TExercises/>,plans:<TPlans/>,finance:<TFinance/>}
  const athletePages={profile:<AProfile darkMode={darkMode} setDarkMode={setDarkMode}/>,dashboard:<ADashboard/>,myplan:<AMyPlan/>,progress:<AProgress/>,achievements:<AAchievements/>}
  const pages = role==='trainer' ? trainerPages : athletePages
  const profile = role==='trainer' ? {name:'Coach Maryam',role:'trainer'} : {name:'Sara Ahmadi',role:'athlete'}

  function handleRoleSwitch(r) { setRole(r); setPage(r==='trainer'?'dashboard':'profile'); setSideOpen(false) }

  return (
    <div style={{display:'flex',flexDirection:'column',minHeight:'100vh',background:'var(--bg)'}}>
      {/* Demo banner */}
      <div style={{background:'#1a3d32',borderBottom:'0.5px solid #2a5a45',padding:'8px 16px',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:8,flexShrink:0}}>
        <div style={{fontSize:13,color:'#4cd4a0'}}>👀 <strong>Demo mode</strong> — sample data, nothing is saved.</div>
        <button onClick={()=>navigate('/')} style={{padding:'4px 12px',borderRadius:6,border:'0.5px solid #2a5a45',background:'transparent',color:'#4cd4a0',fontSize:12,cursor:'pointer'}}>← Back to login</button>
      </div>

      <div style={{display:'flex',flex:1,overflow:'hidden'}}>
        {/* Overlay */}
        {isMobile&&sideOpen&&<div onClick={()=>setSideOpen(false)} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',zIndex:199}}/>}

        {/* Sidebar — with role switcher exactly like prototype */}
        <div style={{width:210,background:'var(--bg2)',borderRight:'0.5px solid var(--border)',display:'flex',flexDirection:'column',padding:'1.25rem 0.75rem',gap:2,position:'fixed',top:42,left:0,height:'calc(100vh - 42px)',zIndex:200,transition:'transform 0.25s',transform:isMobile&&!sideOpen?'translateX(-210px)':'translateX(0)',overflowY:'auto'}}>
          <div style={{fontSize:17,fontWeight:600,color:TEAL,padding:'0 0.5rem 0.75rem',letterSpacing:'-0.02em'}}>SmartCoach</div>
          {/* Role switcher */}
          <div style={{display:'flex',background:'var(--bg3)',borderRadius:8,padding:3,marginBottom:'1rem'}}>
            {['trainer','athlete'].map(r=>(
              <button key={r} onClick={()=>handleRoleSwitch(r)} style={{flex:1,padding:5,fontSize:12,border:'none',borderRadius:6,cursor:'pointer',fontWeight:500,background:role===r?TEAL:'transparent',color:role===r?'#fff':'var(--text2)',transition:'all 0.15s'}}>
                {r.charAt(0).toUpperCase()+r.slice(1)}
              </button>
            ))}
          </div>
          {nav.map(n=>(
            <div key={n.id} onClick={()=>{setPage(n.id);setSideOpen(false);}} style={{display:'flex',alignItems:'center',gap:9,padding:'8px 10px',borderRadius:8,fontSize:14,color:page===n.id?'var(--teal-mid)':'var(--text2)',cursor:'pointer',background:page===n.id?'var(--teal-light)':'transparent',fontWeight:page===n.id?500:400,marginBottom:2,transition:'background 0.15s'}}>
              <span style={{fontSize:16}}>{n.icon}</span>{n.label}
            </div>
          ))}
          <div style={{flex:1}}/>
          <div style={{padding:'0.75rem 0.5rem',borderTop:'0.5px solid var(--border)'}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>
              <span style={{fontSize:12,color:'var(--text2)'}}>{darkMode?'🌙 Dark':'☀️ Light'}</span>
              <Toggle on={darkMode} onToggle={()=>setDarkMode(!darkMode)}/>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              <Avatar name={profile.name} size={28}/>
              <div>
                <div style={{fontSize:12,fontWeight:500,color:'var(--text)',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis',maxWidth:120}}>{profile.name}</div>
                <div style={{fontSize:11,color:'var(--text3)'}}>{profile.role} · Demo</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main */}
        <div style={{flex:1,marginLeft:isMobile?0:210,padding:isMobile?'1rem':'1.5rem',minWidth:0,overflowY:'auto'}}>
          <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:'1.5rem'}}>
            {isMobile&&<button onClick={()=>setSideOpen(s=>!s)} style={{background:'var(--bg3)',border:'0.5px solid var(--border)',borderRadius:8,padding:'7px 10px',cursor:'pointer',fontSize:16,color:'var(--text)',lineHeight:1,flexShrink:0}}>☰</button>}
            {isMobile&&<div style={{fontSize:16,fontWeight:500,color:TEAL}}>SmartCoach</div>}
            <div style={{marginLeft:'auto',display:'flex',alignItems:'center',gap:8}}>
              <span style={{fontSize:12,color:'var(--text2)'}}>{darkMode?'🌙':'☀️'}</span>
              <Toggle on={darkMode} onToggle={()=>setDarkMode(!darkMode)}/>
            </div>
          </div>
          {pages[page]}
        </div>
      </div>
    </div>
  )
}