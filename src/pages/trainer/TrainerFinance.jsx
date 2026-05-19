import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useToast } from '../../context/ToastContext'
import { Card, STitle, Btn, Badge, Avatar, Metric } from '../../components/UI'
import Modal from '../../components/Modal'

export default function TrainerFinance({ athletes, profile }) {
  const { toast } = useToast()
  const [records, setRecords] = useState([])
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ athlete_id:'', amount:'', currency:'EUR', note:'', paid:false })
  const set = (k,v) => setForm(f=>({...f,[k]:v}))

  useEffect(() => { fetchRecords() }, [])

  async function fetchRecords() {
    const { data, error } = await supabase.from('finance')
      .select('*, profiles!finance_athlete_id_fkey(name)')
      .eq('trainer_id', profile.id)
      .order('date', { ascending: false })
    if (error) toast({ message: error.message, type:'error' })
    else setRecords(data||[])
  }

  async function addRecord() {
    if (!form.athlete_id || !form.amount) return toast({ message:'Select athlete and enter amount', type:'error' })
    const { error } = await supabase.from('finance').insert({
      athlete_id: form.athlete_id,
      trainer_id: profile.id,
      amount: parseFloat(form.amount),
      currency: form.currency,
      note: form.note,
      paid: form.paid,
      date: new Date().toISOString().split('T')[0]
    })
    if (error) return toast({ message: error.message, type:'error' })
    toast({ message: 'Payment record added ✓' })
    setShowAdd(false)
    setForm({ athlete_id:'', amount:'', currency:'EUR', note:'', paid:false })
    fetchRecords()
  }

  async function togglePaid(rec) {
    const { error } = await supabase.from('finance').update({ paid: !rec.paid }).eq('id', rec.id)
    if (error) return toast({ message: error.message, type:'error' })
    toast({ message: rec.paid ? 'Marked as unpaid' : 'Marked as paid ✓' })
    fetchRecords()
  }

  async function deleteRecord(id) {
    const { error } = await supabase.from('finance').delete().eq('id', id)
    if (error) return toast({ message: error.message, type:'error' })
    toast({ message: 'Record deleted' })
    fetchRecords()
  }

  const totalPaid = records.filter(r=>r.paid).reduce((s,r)=>s+Number(r.amount),0)
  const totalUnpaid = records.filter(r=>!r.paid).reduce((s,r)=>s+Number(r.amount),0)

  return (
    <div>
      {showAdd && (
        <Modal title="Add payment record" onClose={()=>setShowAdd(false)}>
          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            <div>
              <label style={{fontSize:12,color:'var(--text2)'}}>Athlete</label>
              <select value={form.athlete_id} onChange={e=>set('athlete_id',e.target.value)}
                style={{width:'100%',marginTop:5,padding:'8px 10px',borderRadius:8,border:'0.5px solid var(--border)',background:'var(--bg3)',color:'var(--text)',fontSize:13,outline:'none'}}>
                <option value="">Select athlete...</option>
                {athletes.map(a=><option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:8}}>
              <div>
                <label style={{fontSize:12,color:'var(--text2)'}}>Amount</label>
                <input type="number" value={form.amount} onChange={e=>set('amount',e.target.value)} placeholder="300"
                  style={{width:'100%',marginTop:5,padding:'8px 10px',borderRadius:8,border:'0.5px solid var(--border)',background:'var(--bg3)',color:'var(--text)',fontSize:13,outline:'none'}}/>
              </div>
              <div>
                <label style={{fontSize:12,color:'var(--text2)'}}>Currency</label>
                <select value={form.currency} onChange={e=>set('currency',e.target.value)}
                  style={{width:'100%',marginTop:5,padding:'8px 10px',borderRadius:8,border:'0.5px solid var(--border)',background:'var(--bg3)',color:'var(--text)',fontSize:13,outline:'none'}}>
                  {['EUR','USD','SEK','IRR'].map(c=><option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label style={{fontSize:12,color:'var(--text2)'}}>Note</label>
              <input value={form.note} onChange={e=>set('note',e.target.value)} placeholder="e.g. Monthly fee May 2026"
                style={{width:'100%',marginTop:5,padding:'8px 10px',borderRadius:8,border:'0.5px solid var(--border)',background:'var(--bg3)',color:'var(--text)',fontSize:13,outline:'none'}}/>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:10}}>
              <input type="checkbox" checked={form.paid} onChange={e=>set('paid',e.target.checked)} style={{accentColor:'var(--teal)',width:16,height:16}}/>
              <span style={{fontSize:13,color:'var(--text)'}}>Mark as already paid</span>
            </div>
            <div style={{display:'flex',justifyContent:'center',gap:10,marginTop:4}}>
              <Btn variant="primary" onClick={addRecord}>Add record</Btn>
              <Btn onClick={()=>setShowAdd(false)}>Cancel</Btn>
            </div>
          </div>
        </Modal>
      )}

      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'1.5rem',flexWrap:'wrap',gap:8}}>
        <div>
          <div style={{fontSize:22,fontWeight:500,color:'var(--text)'}}>Finance</div>
          <div style={{fontSize:14,color:'var(--text2)',marginTop:2}}>Payment tracking across all athletes</div>
        </div>
        <Btn variant="primary" onClick={()=>setShowAdd(true)}>＋ Add record</Btn>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12,marginBottom:14}}>
        <Metric label="Collected" value={`€${totalPaid.toFixed(0)}`} color="var(--teal)"/>
        <Metric label="Outstanding" value={`€${totalUnpaid.toFixed(0)}`} color="#f07070"/>
        <Metric label="Total records" value={records.length}/>
      </div>

      {records.length===0
        ? <Card><div style={{textAlign:'center',padding:'2rem',color:'var(--text2)'}}>No payment records yet.</div></Card>
        : <Card>
          {records.map(r=>(
            <div key={r.id} style={{display:'flex',alignItems:'center',gap:10,padding:'10px 0',borderBottom:'0.5px solid var(--border)'}}>
              <Avatar name={r.profiles?.name||'?'} size={34}/>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:500,color:'var(--text)'}}>{r.profiles?.name}</div>
                <div style={{fontSize:11,color:'var(--text2)'}}>{r.currency} {r.amount} · {r.note||'—'} · {r.date}</div>
              </div>
              <Btn size="sm" variant={r.paid?'ghost':'primary'} onClick={()=>togglePaid(r)}>
                {r.paid?'✓ Paid':'Mark paid'}
              </Btn>
              <Btn size="sm" variant="danger" onClick={()=>deleteRecord(r.id)}>Del</Btn>
            </div>
          ))}
        </Card>
      }
    </div>
  )
}