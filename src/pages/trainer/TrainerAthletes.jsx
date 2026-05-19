import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useToast } from '../../context/ToastContext'
import { Card, STitle, Btn, Badge, Avatar, Metric, Divider } from '../../components/UI'
import Modal from '../../components/Modal'

const MOODS = ['😞','😐','🙂','😄','🔥']

export default function TrainerAthletes({ athletes, profile, refresh }) {
  const { toast } = useToast()
  const [sel, setSel] = useState(null)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ name:'', email:'', password:'', age:'', height:'' })
  const [loading, setLoading] = useState(false)
  const set = (k,v) => setForm(f=>({...f,[k]:v}))

  async function addAthlete() {
    if (!form.name || !form.email || !form.password)
      return toast({ message:'Name, email and password are required', type:'error' })
    setLoading(true)
    try {
      // Create auth user
      const { data, error } = await supabase.auth.admin.createUser({
        email: form.email, password: form.password,
        user_metadata: { name: form.name, role: 'athlete' },
        email_confirm: true
      })
      if (error) throw error
      // Update profile with trainer + details
      await supabase.from('profiles').update({
        trainer_id: profile.id,
        age: form.age ? parseInt(form.age) : null,
        height: form.height ? parseInt(form.height) : null,
      }).eq('id', data.user.id)
      toast({ message: `${form.name} added successfully ✓` })
      setShowAdd(false)
      setForm({ name:'', email:'', password:'', age:'', height:'' })
      refresh()
    } catch(e) {
      // Fallback: athlete signs up themselves with trainer ID shown
      toast({ message: `Share your Trainer ID with the athlete to let them sign up: ${profile.id.slice(0,8)}...`, type:'error' })
    } finally { setLoading(false) }
  }

  async function removeAthlete(ath) {
    const { error } = await supabase.from('profiles')
      .update({ trainer_id: null }).eq('id', ath.id)
    if (error) return toast({ message: error.message, type:'error' })
    toast({ message: `${ath.name} removed from your roster` })
    setSel(null)
    refresh()
  }

  return (
    <div>
      {showAdd && (
        <Modal title="Add athlete" onClose={()=>setShowAdd(false)}>
          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            <div style={{padding:'10px 12px',background:'var(--teal-light)',borderRadius:8,fontSize:12,color:'var(--teal-mid)'}}>
              💡 Share your Trainer ID with athletes so they can sign up themselves:<br/>
              <strong style={{wordBreak:'break-all'}}>{profile.id}</strong>
            </div>
            <Field label="Full name" value={form.name} onChange={v=>set('name',v)} placeholder="Sara Ahmadi"/>
            <Field label="Email" type="email" value={form.email} onChange={v=>set('email',v)} placeholder="sara@email.com"/>
            <Field label="Temporary password" type="password" value={form.password} onChange={v=>set('password',v)} placeholder="Min 6 characters"/>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
              <Field label="Age" type="number" value={form.age} onChange={v=>set('age',v)} placeholder="28"/>
              <Field label="Height (cm)" type="number" value={form.height} onChange={v=>set('height',v)} placeholder="170"/>
            </div>
            <div style={{display:'flex',justifyContent:'center',gap:10,marginTop:4}}>
              <Btn variant="primary" onClick={addAthlete} disabled={loading}>
                {loading ? 'Adding...' : 'Add athlete'}
              </Btn>
              <Btn onClick={()=>setShowAdd(false)}>Cancel</Btn>
            </div>
          </div>
        </Modal>
      )}

      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'1.5rem',flexWrap:'wrap',gap:8}}>
        <div>
          <div style={{fontSize:22,fontWeight:500,color:'var(--text)'}}>Athletes</div>
          <div style={{fontSize:14,color:'var(--text2)',marginTop:2}}>{athletes.length} athletes in your roster</div>
        </div>
        <Btn variant="primary" onClick={()=>setShowAdd(true)}>＋ Add athlete</Btn>
      </div>

      {athletes.length===0
        ? <Card><div style={{textAlign:'center',padding:'3rem',color:'var(--text2)'}}>No athletes yet. Add your first athlete!</div></Card>
        : <Card>
          {athletes.map(a=>(
            <div key={a.id}>
              <div onClick={()=>setSel(sel===a.id?null:a.id)} style={{display:'flex',alignItems:'center',gap:10,padding:'10px 0',borderBottom:'0.5px solid var(--border)',cursor:'pointer'}}>
                <Avatar name={a.name} size={36}/>
                <div style={{flex:1}}>
                  <div style={{fontSize:14,fontWeight:500,color:'var(--text)'}}>{a.name}</div>
                  <div style={{fontSize:12,color:'var(--text2)'}}>Age {a.age||'—'} · {a.height?a.height+'cm':'—'}</div>
                </div>
                <Badge variant="teal">{a.streak_count||0}d 🔥</Badge>
                <span style={{fontSize:11,color:'var(--text3)'}}>{sel===a.id?'▲':'▼'}</span>
              </div>
              {sel===a.id && (
                <div style={{padding:'12px 0 8px'}}>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10,marginBottom:12}}>
                    <Metric label="Streak" value={`${a.streak_count||0}d`} color="var(--amber)"/>
                    <Metric label="Height" value={a.height?`${a.height}cm`:'—'}/>
                    <Metric label="Age" value={a.age||'—'}/>
                  </div>
                  <div style={{fontSize:12,color:'var(--text2)',marginBottom:6}}>Trainer ID to share with athlete:</div>
                  <div style={{fontSize:11,background:'var(--bg3)',padding:'6px 10px',borderRadius:6,color:'var(--text)',wordBreak:'break-all',marginBottom:12}}>{profile.id}</div>
                  <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                    <Btn variant="danger" size="sm" onClick={()=>removeAthlete(a)}>Remove from roster</Btn>
                  </div>
                </div>
              )}
            </div>
          ))}
        </Card>
      }
    </div>
  )
}

function Field({ label, value, onChange, placeholder, type='text' }) {
  return (
    <div>
      <label style={{fontSize:12,color:'var(--text2)',fontWeight:500}}>{label}</label>
      <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
        style={{width:'100%',marginTop:5,padding:'8px 10px',borderRadius:8,border:'0.5px solid var(--border)',background:'var(--bg3)',color:'var(--text)',fontSize:13,outline:'none'}}/>
    </div>
  )
}