import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useToast } from '../../context/ToastContext'
import { Card, STitle, Btn, Badge, Avatar, Metric } from '../../components/UI'
import Modal from '../../components/Modal'

const MOODS = ['😞','😐','🙂','😄','🔥']
const MOOD_LABELS = ['Rough','Okay','Good','Great','On fire']
const DAYS_OF_WEEK = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']

export default function TrainerPlans({ athletes, exercises, profile }) {
  const { toast } = useToast()
  const [selAthlete, setSelAthlete] = useState(athletes[0]||null)
  const [plans, setPlans] = useState([])
  const [selPlan, setSelPlan] = useState(null)
  const [planExs, setPlanExs] = useState([])
  const [showLogModal, setShowLogModal] = useState(false)
  const [showNewPlan, setShowNewPlan] = useState(false)
  const [showAddEx, setShowAddEx] = useState(false)
  const [newPlanName, setNewPlanName] = useState('')
  const [mood, setMood] = useState(2)
  const [note, setNote] = useState('')
  const [done, setDone] = useState({})
  const [vals, setVals] = useState({})
  const [newEx, setNewEx] = useState({ exercise_id:'', sets:'', reps:'', weight_kg:'', day_of_week:'Monday' })

  useEffect(() => { if (selAthlete) fetchPlans() }, [selAthlete])
  useEffect(() => { if (selPlan) fetchPlanExercises() }, [selPlan])

  async function fetchPlans() {
    const { data } = await supabase.from('plan')
      .select('*').eq('athlete_id', selAthlete.id).eq('trainer_id', profile.id)
    setPlans(data||[])
    setSelPlan(data?.[0]||null)
  }

  async function fetchPlanExercises() {
    const { data } = await supabase.from('plan_exercise')
      .select('*, exercise(name)').eq('plan_id', selPlan.id).order('sort_order')
    setPlanExs(data||[])
  }

  async function createPlan() {
    if (!newPlanName.trim()) return toast({ message:'Plan name required', type:'error' })
    const { data, error } = await supabase.from('plan').insert({
      name: newPlanName, athlete_id: selAthlete.id, trainer_id: profile.id
    }).select().single()
    if (error) return toast({ message: error.message, type:'error' })
    toast({ message: `Plan "${newPlanName}" created ✓` })
    setNewPlanName('')
    setShowNewPlan(false)
    setPlans(p=>[...p, data])
    setSelPlan(data)
  }

  async function deletePlan() {
    if (!selPlan) return
    const { error } = await supabase.from('plan').delete().eq('id', selPlan.id)
    if (error) return toast({ message: error.message, type:'error' })
    toast({ message: 'Plan deleted' })
    fetchPlans()
  }

  async function addExercise() {
    if (!newEx.exercise_id) return toast({ message:'Select an exercise', type:'error' })
    const { error } = await supabase.from('plan_exercise').insert({
      plan_id: selPlan.id,
      exercise_id: parseInt(newEx.exercise_id),
      sets: newEx.sets ? parseInt(newEx.sets) : null,
      reps: newEx.reps ? parseInt(newEx.reps) : null,
      weight_kg: newEx.weight_kg ? parseFloat(newEx.weight_kg) : null,
      day_of_week: newEx.day_of_week,
      sort_order: planExs.length
    })
    if (error) return toast({ message: error.message, type:'error' })
    toast({ message: 'Exercise added to plan ✓' })
    setShowAddEx(false)
    setNewEx({ exercise_id:'', sets:'', reps:'', weight_kg:'', day_of_week:'Monday' })
    fetchPlanExercises()
  }

  async function removeExercise(id) {
    const { error } = await supabase.from('plan_exercise').delete().eq('id', id)
    if (error) return toast({ message: error.message, type:'error' })
    toast({ message: 'Exercise removed' })
    fetchPlanExercises()
  }

  async function logSession() {
    const entries = planExs
      .filter(ex => done[ex.id])
      .map(ex => ({
        athlete_id: selAthlete.id,
        trainer_id: profile.id,
        exercise_id: ex.exercise_id,
        date: new Date().toISOString().split('T')[0],
        sets_done: vals[ex.id]?.sets ? parseInt(vals[ex.id].sets) : ex.sets,
        reps_done: vals[ex.id]?.reps ? parseInt(vals[ex.id].reps) : ex.reps,
        weight_used: vals[ex.id]?.weight ? parseFloat(vals[ex.id].weight) : ex.weight_kg,
        athlete_mood: String(mood+1),
        note, attendance: true
      }))

    if (entries.length === 0) return toast({ message:'Check at least one exercise', type:'error' })

    const { error } = await supabase.from('journal').insert(entries)
    if (error) return toast({ message: error.message, type:'error' })
    toast({ message: `Session logged for ${selAthlete.name} ✓` })
    setShowLogModal(false)
    setDone({}); setVals({}); setNote(''); setMood(2)
  }

  return (
    <div>
      {showNewPlan && (
        <Modal title="New plan" onClose={()=>setShowNewPlan(false)}>
          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            <div>
              <label style={{fontSize:12,color:'var(--text2)'}}>Plan name</label>
              <input value={newPlanName} onChange={e=>setNewPlanName(e.target.value)} placeholder="e.g. Strength A"
                style={{width:'100%',marginTop:5,padding:'8px 10px',borderRadius:8,border:'0.5px solid var(--border)',background:'var(--bg3)',color:'var(--text)',fontSize:13,outline:'none'}}/>
            </div>
            <div style={{display:'flex',justifyContent:'center',gap:10}}>
              <Btn variant="primary" onClick={createPlan}>Create plan</Btn>
              <Btn onClick={()=>setShowNewPlan(false)}>Cancel</Btn>
            </div>
          </div>
        </Modal>
      )}

      {showAddEx && (
        <Modal title="Add exercise to plan" onClose={()=>setShowAddEx(false)}>
          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            <div>
              <label style={{fontSize:12,color:'var(--text2)'}}>Exercise</label>
              <select value={newEx.exercise_id} onChange={e=>setNewEx(x=>({...x,exercise_id:e.target.value}))}
                style={{width:'100%',marginTop:5,padding:'8px 10px',borderRadius:8,border:'0.5px solid var(--border)',background:'var(--bg3)',color:'var(--text)',fontSize:13,outline:'none'}}>
                <option value="">Select exercise...</option>
                {exercises.map(e=><option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8}}>
              {[['sets','Sets'],['reps','Reps'],['weight_kg','Weight (kg)']].map(([k,l])=>(
                <div key={k}>
                  <label style={{fontSize:12,color:'var(--text2)'}}>{l}</label>
                  <input type="number" value={newEx[k]} onChange={e=>setNewEx(x=>({...x,[k]:e.target.value}))} placeholder="—"
                    style={{width:'100%',marginTop:5,padding:'8px 10px',borderRadius:8,border:'0.5px solid var(--border)',background:'var(--bg3)',color:'var(--text)',fontSize:13,outline:'none'}}/>
                </div>
              ))}
            </div>
            <div>
              <label style={{fontSize:12,color:'var(--text2)'}}>Day of week</label>
              <select value={newEx.day_of_week} onChange={e=>setNewEx(x=>({...x,day_of_week:e.target.value}))}
                style={{width:'100%',marginTop:5,padding:'8px 10px',borderRadius:8,border:'0.5px solid var(--border)',background:'var(--bg3)',color:'var(--text)',fontSize:13,outline:'none'}}>
                {DAYS_OF_WEEK.map(d=><option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div style={{display:'flex',justifyContent:'center',gap:10}}>
              <Btn variant="primary" onClick={addExercise}>Add to plan</Btn>
              <Btn onClick={()=>setShowAddEx(false)}>Cancel</Btn>
            </div>
          </div>
        </Modal>
      )}

      {showLogModal && (
        <Modal title={`Log session · ${selAthlete?.name}`} onClose={()=>setShowLogModal(false)} maxWidth={480}>
          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            {planExs.map(ex=>(
              <div key={ex.id} style={{background:'var(--bg3)',borderRadius:10,padding:'10px 12px',border:`0.5px solid ${done[ex.id]?'var(--teal)':'var(--border)'}`,transition:'border 0.15s'}}>
                <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:done[ex.id]?10:0}}>
                  <input type="checkbox" checked={!!done[ex.id]} onChange={e=>setDone(p=>({...p,[ex.id]:e.target.checked}))}
                    style={{accentColor:'var(--teal)',width:16,height:16,cursor:'pointer'}}/>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,fontWeight:500,color:'var(--text)'}}>{ex.exercise?.name}</div>
                    <div style={{fontSize:11,color:'var(--text2)'}}>Plan: {ex.sets} sets · {ex.reps} reps{ex.weight_kg?` · ${ex.weight_kg}kg`:''}</div>
                  </div>
                </div>
                {done[ex.id] && (
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8,paddingLeft:26}}>
                    {[['sets','Sets',ex.sets],['reps','Reps',ex.reps],['weight','kg',ex.weight_kg]].map(([k,l,ph])=>(
                      <div key={k}>
                        <div style={{fontSize:11,color:'var(--text2)',marginBottom:3}}>{l}</div>
                        <input type="number" placeholder={ph||'—'} value={vals[ex.id]?.[k]||''}
                          onChange={e=>setVals(p=>({...p,[ex.id]:{...p[ex.id],[k]:e.target.value}}))}
                          style={{width:'100%',padding:'6px 8px',borderRadius:7,border:'0.5px solid var(--border)',background:'var(--bg2)',color:'var(--text)',fontSize:12,outline:'none'}}/>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div>
              <div style={{fontSize:12,color:'var(--text2)',marginBottom:6}}>Athlete mood today</div>
              <div style={{display:'flex',gap:6}}>
                {MOODS.map((m,i)=>(
                  <button key={i} onClick={()=>setMood(i)} style={{
                    border:`0.5px solid ${mood===i?'var(--teal)':'var(--border)'}`,borderRadius:8,padding:'6px 10px',
                    fontSize:18,cursor:'pointer',background:mood===i?'var(--teal-light)':'var(--bg3)'
                  }}>{m}</button>
                ))}
              </div>
              <div style={{fontSize:11,color:'var(--teal-mid)',marginTop:4}}>{MOOD_LABELS[mood]}</div>
            </div>
            <div>
              <div style={{fontSize:12,color:'var(--text2)',marginBottom:3}}>Notes</div>
              <input value={note} onChange={e=>setNote(e.target.value)} placeholder="e.g. Great form today"
                style={{width:'100%',padding:'8px 10px',borderRadius:8,border:'0.5px solid var(--border)',background:'var(--bg3)',color:'var(--text)',fontSize:13,outline:'none'}}/>
            </div>
            <div style={{display:'flex',justifyContent:'center',gap:10,marginTop:4}}>
              <Btn variant="primary" onClick={logSession}>Save session</Btn>
              <Btn onClick={()=>setShowLogModal(false)}>Cancel</Btn>
            </div>
          </div>
        </Modal>
      )}

      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'1.5rem',flexWrap:'wrap',gap:8}}>
        <div>
          <div style={{fontSize:22,fontWeight:500,color:'var(--text)'}}>Plans</div>
          <div style={{fontSize:14,color:'var(--text2)',marginTop:2}}>Build and assign workout plans</div>
        </div>
        <Btn variant="primary" onClick={()=>setShowNewPlan(true)}>＋ New plan</Btn>
      </div>

      {athletes.length===0
        ? <Card><div style={{textAlign:'center',padding:'2rem',color:'var(--text2)'}}>Add athletes first before creating plans.</div></Card>
        : (
          <div style={{display:'flex',gap:12,alignItems:'flex-start'}}>
            <div style={{width:150,background:'var(--bg2)',border:'0.5px solid var(--border)',borderRadius:12,padding:'0.75rem',flexShrink:0}}>
              <div style={{fontSize:11,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:8}}>Athletes</div>
              {athletes.map(a=>(
                <div key={a.id} onClick={()=>setSelAthlete(a)} style={{display:'flex',alignItems:'center',gap:7,padding:'6px 8px',borderRadius:7,cursor:'pointer',background:selAthlete?.id===a.id?'var(--teal-light)':'transparent',marginBottom:2}}>
                  <Avatar name={a.name} size={24}/>
                  <div style={{fontSize:12,fontWeight:selAthlete?.id===a.id?500:400,color:selAthlete?.id===a.id?'var(--teal-mid)':'var(--text2)',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{a.name.split(' ')[0]}</div>
                </div>
              ))}
            </div>

            <div style={{flex:1}}>
              {plans.length===0
                ? <Card><div style={{textAlign:'center',padding:'2rem',color:'var(--text2)'}}>No plans for {selAthlete?.name} yet.<br/><br/><Btn variant="primary" onClick={()=>setShowNewPlan(true)}>Create first plan</Btn></div></Card>
                : (
                  <Card>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12,flexWrap:'wrap',gap:8}}>
                      <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                        {plans.map(p=>(
                          <button key={p.id} onClick={()=>setSelPlan(p)} style={{padding:'5px 12px',borderRadius:7,border:`1.5px solid ${selPlan?.id===p.id?'var(--teal)':'var(--border)'}`,background:selPlan?.id===p.id?'var(--teal-light)':'transparent',color:selPlan?.id===p.id?'var(--teal-mid)':'var(--text2)',fontSize:13,cursor:'pointer',fontWeight:selPlan?.id===p.id?500:400}}>{p.name}</button>
                        ))}
                      </div>
                      <div style={{display:'flex',gap:8}}>
                        <Btn size="sm" variant="danger" onClick={deletePlan}>Delete plan</Btn>
                      </div>
                    </div>

                    {planExs.length===0
                      ? <div style={{textAlign:'center',padding:'1.5rem',color:'var(--text2)',fontSize:13}}>No exercises in this plan yet.</div>
                      : planExs.map((ex,i)=>(
                        <div key={ex.id} style={{display:'flex',alignItems:'center',gap:10,padding:'9px 0',borderBottom:'0.5px solid var(--border)'}}>
                          <div style={{width:22,height:22,borderRadius:6,background:'var(--teal-light)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,color:'var(--teal-mid)',fontWeight:500}}>{i+1}</div>
                          <div style={{flex:1}}>
                            <div style={{fontSize:13,fontWeight:500,color:'var(--text)'}}>{ex.exercise?.name}</div>
                            <div style={{fontSize:11,color:'var(--text2)'}}>{ex.day_of_week} · {ex.sets} sets · {ex.reps} reps{ex.weight_kg?` · ${ex.weight_kg}kg`:''}</div>
                          </div>
                          <Btn size="sm" variant="danger" onClick={()=>removeExercise(ex.id)}>Remove</Btn>
                        </div>
                      ))
                    }
                    <div style={{marginTop:12,display:'flex',gap:8,flexWrap:'wrap'}}>
                      <Btn variant="secondary" size="sm" onClick={()=>setShowAddEx(true)}>＋ Add exercise</Btn>
                      <Btn variant="primary" size="sm" onClick={()=>setShowLogModal(true)}>Log session</Btn>
                    </div>
                  </Card>
                )
              }
            </div>
          </div>
        )
      }
    </div>
  )
}