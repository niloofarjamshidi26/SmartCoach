import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useToast } from '../../context/ToastContext'
import { Card, STitle, Btn, Badge } from '../../components/UI'
import Modal from '../../components/Modal'

const TYPES  = ['Strength', 'Cardio', 'Core', 'Flexibility', 'Balance']
const PLACES = ['Gym', 'Outdoor', 'Home', 'Any']

export default function TrainerExercises({ exercises, profile, refresh }) {
  const { toast } = useToast()
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing]     = useState(null) // null = new, obj = edit
  const [deleting, setDeleting]   = useState(null)
  const [form, setForm] = useState({ name: '', type: 'Strength', target_area: '', place: 'Gym' })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  function openNew()  { setForm({ name: '', type: 'Strength', target_area: '', place: 'Gym' }); setEditing(null); setShowModal(true) }
  function openEdit(e){ setForm({ name: e.name, type: e.type, target_area: e.target_area, place: e.place }); setEditing(e); setShowModal(true) }

  async function save() {
    if (!form.name.trim()) return toast({ message: 'Exercise name is required', type: 'error' })
    if (editing) {
      const { error } = await supabase.from('exercise').update({ ...form }).eq('id', editing.id)
      if (error) return toast({ message: error.message, type: 'error' })
      toast({ message: 'Exercise updated ✓' })
    } else {
      const { error } = await supabase.from('exercise').insert({ ...form, trainer_id: profile.id })
      if (error) return toast({ message: error.message, type: 'error' })
      toast({ message: 'Exercise added ✓' })
    }
    setShowModal(false)
    refresh()
  }

  async function confirmDelete() {
    const { error } = await supabase.from('exercise').delete().eq('id', deleting.id)
    if (error) return toast({ message: error.message, type: 'error' })
    toast({ message: 'Exercise deleted' })
    setDeleting(null)
    refresh()
  }

  return (
    <div>
      {showModal && (
        <Modal title={editing ? 'Edit exercise' : 'New exercise'} onClose={() => setShowModal(false)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Field label="Name" value={form.name} onChange={v => set('name', v)} placeholder="e.g. Bench press" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <SelectField label="Type" value={form.type} onChange={v => set('type', v)} options={TYPES} />
              <SelectField label="Place" value={form.place} onChange={v => set('place', v)} options={PLACES} />
            </div>
            <Field label="Target area" value={form.target_area} onChange={v => set('target_area', v)} placeholder="e.g. Chest, Legs" />
            <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 4 }}>
              <Btn variant="primary" onClick={save}>Save exercise</Btn>
              <Btn onClick={() => setShowModal(false)}>Cancel</Btn>
            </div>
          </div>
        </Modal>
      )}

      {deleting && (
        <Modal title="Delete exercise?" onClose={() => setDeleting(null)}>
          <p style={{ fontSize: 14, color: 'var(--text2)', marginBottom: 16 }}>
            Are you sure you want to delete <strong style={{ color: 'var(--text)' }}>{deleting.name}</strong>? This cannot be undone.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 10 }}>
            <Btn variant="danger" onClick={confirmDelete}>Yes, delete</Btn>
            <Btn onClick={() => setDeleting(null)}>Cancel</Btn>
          </div>
        </Modal>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: 8 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 500, color: 'var(--text)' }}>Exercise library</div>
          <div style={{ fontSize: 14, color: 'var(--text2)', marginTop: 2 }}>{exercises.length} exercises · Filter coming soon</div>
        </div>
        <Btn variant="primary" onClick={openNew}>＋ New exercise</Btn>
      </div>

      {exercises.length === 0
        ? <Card><div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text2)' }}>No exercises yet. Add your first one!</div></Card>
        : (
          <Card>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: 8, paddingBottom: 8, borderBottom: '0.5px solid var(--border)', marginBottom: 4 }}>
              {['Exercise', 'Type', 'Target', 'Place', ''].map((h, i) => (
                <div key={i} style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</div>
              ))}
            </div>
            {exercises.map(e => (
              <div key={e.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: 8, padding: '10px 0', borderBottom: '0.5px solid var(--border)', alignItems: 'center' }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)' }}>{e.name}</div>
                <Badge variant="gray">{e.type}</Badge>
                <Badge variant="gray">{e.target_area}</Badge>
                <Badge variant="gray">{e.place}</Badge>
                <div style={{ display: 'flex', gap: 6 }}>
                  <Btn size="sm" onClick={() => openEdit(e)}>Edit</Btn>
                  <Btn size="sm" variant="danger" onClick={() => setDeleting(e)}>Del</Btn>
                </div>
              </div>
            ))}
          </Card>
        )
      }
    </div>
  )
}

function Field({ label, value, onChange, placeholder }) {
  return (
    <div>
      <label style={{ fontSize: 12, color: 'var(--text2)', fontWeight: 500 }}>{label}</label>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ width: '100%', marginTop: 5, padding: '8px 10px', borderRadius: 8, border: '0.5px solid var(--border)', background: 'var(--bg3)', color: 'var(--text)', fontSize: 13, outline: 'none' }} />
    </div>
  )
}

function SelectField({ label, value, onChange, options }) {
  return (
    <div>
      <label style={{ fontSize: 12, color: 'var(--text2)', fontWeight: 500 }}>{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)}
        style={{ width: '100%', marginTop: 5, padding: '8px 10px', borderRadius: 8, border: '0.5px solid var(--border)', background: 'var(--bg3)', color: 'var(--text)', fontSize: 13, outline: 'none' }}>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  )
}