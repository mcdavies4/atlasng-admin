import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const MARKET = import.meta.env.VITE_MARKET || 'NG'
const IS_UK  = MARKET === 'UK'

const ZONES            = ['central', 'inner', 'outer']
const COVERAGE_OPTIONS = ['central', 'inner', 'outer', 'all']
const VEHICLE_TYPES    = ['motorbike', 'bicycle', 'car', 'van']

const ZONE_LABELS = IS_UK
  ? { central: 'Central London', inner: 'Inner London', outer: 'Outer London', all: 'All London' }
  : { central: 'Central Abuja',  inner: 'Inner Abuja',  outer: 'Outer Abuja',  all: 'All Abuja'  }

const PHONE_PLACEHOLDER   = IS_UK ? '447700000000'       : '2348012345678'
const COMPANY_PLACEHOLDER = IS_UK ? 'SpeedyLDN Couriers' : 'FastRun Abuja'
const NAME_PLACEHOLDER    = IS_UK ? 'James Courier'       : 'Emeka Dispatch'

const blankBase = { name: '', phone: '', company: '', zone: 'central', coverage_zones: ['central'], rating: 5.0, verified: false, is_available: true }
const blankUK   = { ...blankBase, vehicle_type: 'motorbike', hire_reward_insurance: false }
const blank     = IS_UK ? blankUK : blankBase

const s = {
  page:    { padding: '36px 40px' },
  header:  { display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '28px' },
  title:   { fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 600, letterSpacing: '-0.02em', marginBottom: '4px' },
  subtitle:{ fontSize: '13px', color: 'var(--muted)' },
  addBtn:  { background: 'var(--accent)', color: 'var(--bg)', border: 'none', borderRadius: '8px', padding: '10px 18px', fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: '13px', cursor: 'pointer' },
  grid:    { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '16px' },
  card:    { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px', position: 'relative' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' },
  name:    { fontFamily: 'var(--font-display)', fontSize: '17px', fontWeight: 400, marginBottom: '2px' },
  company: { fontSize: '12px', color: 'var(--muted)' },
  badge:   { padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 500, flexShrink: 0 },
  row:     { display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '6px', fontSize: '12px', color: 'var(--muted)' },
  actions: { display: 'flex', gap: '8px', marginTop: '16px', paddingTop: '14px', borderTop: '1px solid var(--border)', flexWrap: 'wrap' },
  actionBtn:  { flex: 1, padding: '7px', borderRadius: '6px', border: '1px solid var(--border2)', background: 'transparent', color: 'var(--muted)', fontSize: '11px', cursor: 'pointer', fontFamily: 'var(--font-mono)', transition: 'all 0.15s' },
  dangerBtn:  { padding: '7px 12px', borderRadius: '6px', border: '1px solid rgba(245,90,90,0.3)', background: 'transparent', color: 'var(--danger)', fontSize: '11px', cursor: 'pointer', fontFamily: 'var(--font-mono)' },
  overlay:    { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 },
  modal:      { background: 'var(--surface)', border: '1px solid var(--border2)', borderRadius: '14px', padding: '32px', width: '100%', maxWidth: '460px', animation: 'fadeUp 0.3s ease both', maxHeight: '90vh', overflowY: 'auto' },
  modalTitle: { fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 400, marginBottom: '24px' },
  label:   { display: 'block', fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' },
  input:   { width: '100%', background: 'var(--bg)', border: '1px solid var(--border2)', borderRadius: '7px', padding: '10px 12px', color: 'var(--text)', fontFamily: 'var(--font-mono)', fontSize: '13px', outline: 'none', marginBottom: '16px' },
  select:  { width: '100%', background: 'var(--bg)', border: '1px solid var(--border2)', borderRadius: '7px', padding: '10px 12px', color: 'var(--text)', fontSize: '13px', outline: 'none', marginBottom: '16px' },
  modalBtns:  { display: 'flex', gap: '10px', marginTop: '8px' },
  saveBtn:    { flex: 1, background: 'var(--accent)', color: 'var(--bg)', border: 'none', borderRadius: '7px', padding: '11px', fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: '13px', cursor: 'pointer' },
  cancelBtn:  { flex: 1, background: 'transparent', color: 'var(--muted)', border: '1px solid var(--border2)', borderRadius: '7px', padding: '11px', fontFamily: 'var(--font-body)', fontSize: '13px', cursor: 'pointer' },
  empty:      { gridColumn: '1/-1', padding: '60px', textAlign: 'center', color: 'var(--muted)', fontFamily: 'var(--font-mono)', fontSize: '12px' },
  insBanner:  { background: 'rgba(245,90,90,0.08)', border: '1px solid rgba(245,90,90,0.2)', borderRadius: '6px', padding: '8px 12px', fontSize: '11px', color: '#f55a5a', fontFamily: 'var(--font-mono)', marginTop: '6px', marginBottom: '4px' },
  insOk:      { background: 'rgba(184,245,90,0.08)', border: '1px solid rgba(184,245,90,0.2)', borderRadius: '6px', padding: '8px 12px', fontSize: '11px', color: 'var(--accent)', fontFamily: 'var(--font-mono)', marginTop: '6px', marginBottom: '4px' },
}

const vehicleIcon = (v) => ({ motorbike: '🏍️', bicycle: '🚴', car: '🚗', van: '🚐' }[v] || '🏍️')

export default function Riders() {
  const [riders, setRiders]   = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal]     = useState(false)
  const [form, setForm]       = useState(blank)
  const [saving, setSaving]   = useState(false)

  useEffect(() => { load() }, [])

  async function load() {
    const { data } = await supabase.from('riders').select('*').order('created_at', { ascending: false })
    setRiders(data || [])
    setLoading(false)
  }

  async function save() {
    setSaving(true)
    const payload = { ...form }
    if (payload.id) {
      await supabase.from('riders').update(payload).eq('id', payload.id)
    } else {
      delete payload.id
      await supabase.from('riders').insert(payload)
    }
    setSaving(false)
    setModal(false)
    setForm(blank)
    load()
  }

  const toggleVerify    = async (r) => { await supabase.from('riders').update({ verified: !r.verified }).eq('id', r.id); load() }
  const toggleAvail     = async (r) => { await supabase.from('riders').update({ is_available: !r.is_available }).eq('id', r.id); load() }
  const toggleInsurance = async (r) => { await supabase.from('riders').update({ hire_reward_insurance: !r.hire_reward_insurance }).eq('id', r.id); load() }
  const deleteRider     = async (id) => { if (!confirm('Remove this courier?')) return; await supabase.from('riders').delete().eq('id', id); load() }

  const edit    = (r) => { setForm({ ...blank, ...r }); setModal(true) }
  const openAdd = ()  => { setForm(blank); setModal(true) }

  const toggleCoverage = (zone) => {
    const curr = form.coverage_zones || []
    setForm(f => ({ ...f, coverage_zones: curr.includes(zone) ? curr.filter(z => z !== zone) : [...curr, zone] }))
  }

  const label = IS_UK ? 'Couriers' : 'Riders'

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div>
          <div style={s.title}>{label}</div>
          <div style={s.subtitle}>
            {riders.filter(r => r.verified).length} verified · {riders.filter(r => r.is_available).length} available now
            {IS_UK && ` · ${riders.filter(r => r.hire_reward_insurance).length} insured`}
          </div>
        </div>
        <button style={s.addBtn} onClick={openAdd}>+ Add {IS_UK ? 'Courier' : 'Rider'}</button>
      </div>

      <div style={s.grid}>
        {loading && <div style={s.empty}>Loading...</div>}
        {!loading && riders.length === 0 && <div style={s.empty}>No {label.toLowerCase()} yet. Add your first one.</div>}

        {riders.map(r => (
          <div key={r.id} style={s.card} className="fade-up">
            <div style={s.cardHeader}>
              <div>
                <div style={s.name}>{r.name}</div>
                <div style={s.company}>{r.company || 'Independent'}</div>
              </div>
              <span style={{ ...s.badge, background: r.is_available ? 'rgba(184,245,90,0.1)' : 'rgba(107,117,96,0.15)', color: r.is_available ? 'var(--accent)' : 'var(--muted)' }}>
                {r.is_available ? 'online' : 'offline'}
              </span>
            </div>

            <div style={s.row}>📞 <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}>{r.phone}</span></div>
            <div style={s.row}>📍 {ZONE_LABELS[r.zone] || r.zone} · ⭐ {r.rating}</div>
            <div style={s.row}>🗺️ {(r.coverage_zones || []).map(z => ZONE_LABELS[z] || z).join(', ')}</div>
            {IS_UK && r.vehicle_type && <div style={s.row}>{vehicleIcon(r.vehicle_type)} {r.vehicle_type}</div>}

            {IS_UK && (
              <div style={r.hire_reward_insurance ? s.insOk : s.insBanner}>
                {r.hire_reward_insurance ? '✓ Hire & Reward insured' : '⚠️ Insurance not verified'}
              </div>
            )}

            <div style={{ marginTop: IS_UK ? '4px' : '6px' }}>
              <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontFamily: 'var(--font-mono)', background: r.verified ? 'rgba(184,245,90,0.1)' : 'rgba(245,196,90,0.1)', color: r.verified ? 'var(--accent)' : 'var(--warn)' }}>
                {r.verified ? '✓ verified' : '⏳ unverified'}
              </span>
            </div>

            <div style={s.actions}>
              <button style={s.actionBtn} onClick={() => edit(r)}>Edit</button>
              {IS_UK && (
                <button style={{ ...s.actionBtn, color: r.hire_reward_insurance ? 'var(--warn)' : 'var(--accent)', borderColor: r.hire_reward_insurance ? 'rgba(245,196,90,0.3)' : 'rgba(184,245,90,0.3)' }} onClick={() => toggleInsurance(r)}>
                  {r.hire_reward_insurance ? 'Ins ✓' : 'Ins?'}
                </button>
              )}
              <button style={{ ...s.actionBtn, color: r.verified ? 'var(--warn)' : 'var(--accent)', borderColor: r.verified ? 'rgba(245,196,90,0.3)' : 'rgba(184,245,90,0.3)' }} onClick={() => toggleVerify(r)}>
                {r.verified ? 'Unverify' : 'Verify'}
              </button>
              <button style={{ ...s.actionBtn, color: r.is_available ? 'var(--muted)' : 'var(--accent)' }} onClick={() => toggleAvail(r)}>
                {r.is_available ? 'Offline' : 'Online'}
              </button>
              <button style={s.dangerBtn} onClick={() => deleteRider(r.id)}>✕</button>
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <div style={s.overlay} onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div style={s.modal}>
            <div style={s.modalTitle}>{form.id ? `Edit ${IS_UK ? 'Courier' : 'Rider'}` : `Add ${IS_UK ? 'Courier' : 'Rider'}`}</div>

            <label style={s.label}>Full Name</label>
            <input style={s.input} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder={NAME_PLACEHOLDER} />

            <label style={s.label}>WhatsApp Number (with country code)</label>
            <input style={s.input} value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder={PHONE_PLACEHOLDER} />

            <label style={s.label}>Company (optional)</label>
            <input style={s.input} value={form.company || ''} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} placeholder={COMPANY_PLACEHOLDER} />

            {IS_UK && (
              <>
                <label style={s.label}>Vehicle Type</label>
                <select style={s.select} value={form.vehicle_type || 'motorbike'} onChange={e => setForm(f => ({ ...f, vehicle_type: e.target.value }))}>
                  {VEHICLE_TYPES.map(v => <option key={v} value={v}>{vehicleIcon(v)} {v.charAt(0).toUpperCase() + v.slice(1)}</option>)}
                </select>
              </>
            )}

            <label style={s.label}>Primary Zone</label>
            <select style={s.select} value={form.zone} onChange={e => setForm(f => ({ ...f, zone: e.target.value }))}>
              {ZONES.map(z => <option key={z} value={z}>{ZONE_LABELS[z]}</option>)}
            </select>

            <label style={s.label}>Coverage Zones</label>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
              {COVERAGE_OPTIONS.map(z => (
                <button key={z} onClick={() => toggleCoverage(z)} style={{
                  padding: '5px 12px', borderRadius: '5px', border: '1px solid',
                  borderColor: (form.coverage_zones || []).includes(z) ? 'var(--accent)' : 'var(--border2)',
                  background:  (form.coverage_zones || []).includes(z) ? 'rgba(184,245,90,0.1)' : 'transparent',
                  color:       (form.coverage_zones || []).includes(z) ? 'var(--accent)' : 'var(--muted)',
                  fontSize: '12px', cursor: 'pointer', fontFamily: 'var(--font-mono)',
                }}>
                  {ZONE_LABELS[z] || z}
                </button>
              ))}
            </div>

            <label style={s.label}>Rating</label>
            <input style={s.input} type="number" min="1" max="5" step="0.1" value={form.rating}
              onChange={e => setForm(f => ({ ...f, rating: parseFloat(e.target.value) }))} />

            <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', flexWrap: 'wrap' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
                <input type="checkbox" checked={!!form.verified} onChange={e => setForm(f => ({ ...f, verified: e.target.checked }))} />
                Verified
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
                <input type="checkbox" checked={!!form.is_available} onChange={e => setForm(f => ({ ...f, is_available: e.target.checked }))} />
                Available
              </label>
              {IS_UK && (
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={!!form.hire_reward_insurance} onChange={e => setForm(f => ({ ...f, hire_reward_insurance: e.target.checked }))} />
                  H&R Insurance ✓
                </label>
              )}
            </div>

            {IS_UK && !form.hire_reward_insurance && (
              <div style={{ ...s.insBanner, marginBottom: '16px' }}>
                ⚠️ Verify Hire & Reward insurance before marking as insured. Required by UK law for paid deliveries.
              </div>
            )}

            <div style={s.modalBtns}>
              <button style={s.cancelBtn} onClick={() => setModal(false)}>Cancel</button>
              <button style={s.saveBtn} onClick={save} disabled={saving}>{saving ? 'Saving...' : `Save ${IS_UK ? 'Courier' : 'Rider'}`}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
