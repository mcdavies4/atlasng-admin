import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { formatAmount } from '../lib/currency'

const s = {
  page: { padding: '36px 40px' },
  header: { marginBottom: '28px' },
  title: { fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 600, letterSpacing: '-0.02em', marginBottom: '4px' },
  subtitle: { fontSize: '13px', color: 'var(--muted)' },

  filters: { display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' },
  filterBtn: {
    padding: '6px 14px',
    borderRadius: '6px',
    border: '1px solid var(--border2)',
    background: 'transparent',
    color: 'var(--muted)',
    fontSize: '12px',
    cursor: 'pointer',
    fontFamily: 'var(--font-mono)',
    transition: 'all 0.15s',
  },

  tableWrap: { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: {
    fontFamily: 'var(--font-mono)',
    fontSize: '10px',
    color: 'var(--muted)',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    padding: '10px 16px',
    textAlign: 'left',
    borderBottom: '1px solid var(--border)',
    background: 'var(--surface2)',
  },
  td: { padding: '13px 16px', borderBottom: '1px solid var(--border)', fontSize: '13px', verticalAlign: 'middle' },
  mono: { fontFamily: 'var(--font-mono)', fontSize: '11px' },
  empty: { padding: '60px', textAlign: 'center', color: 'var(--muted)', fontFamily: 'var(--font-mono)', fontSize: '12px' },

  statusSelect: {
    background: 'transparent',
    border: '1px solid var(--border2)',
    borderRadius: '5px',
    color: 'var(--text)',
    fontSize: '11px',
    padding: '3px 8px',
    cursor: 'pointer',
    fontFamily: 'var(--font-mono)',
  },
}

const STATUSES = ['all', 'pending', 'accepted', 'in_transit', 'delivered', 'cancelled']

const STATUS_COLOR = {
  pending:    '#f5c45a',
  accepted:   '#5ab4f5',
  in_transit: '#b8f55a',
  delivered:  '#6b7560',
  cancelled:  '#f55a5a',
}

export default function Jobs() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    load()
    const channel = supabase
      .channel('jobs-page')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'deliveries' }, load)
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [])

  async function load() {
    const { data } = await supabase
      .from('deliveries')
      .select('*, riders(name, phone)')
      .order('created_at', { ascending: false })
    setJobs(data || [])
    setLoading(false)
  }

  async function updateStatus(id, status) {
    await supabase.from('deliveries').update({ status }).eq('id', id)
    load()
  }

  const filtered = filter === 'all' ? jobs : jobs.filter(j => j.status === filter)
  const fmt = (n) => formatAmount(n)
  const fmtDate = (d) => new Date(d).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
  const phone = (p) => p?.replace(/^234/, '0') || '—'

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div style={s.title}>Jobs</div>
        <div style={s.subtitle}>{jobs.length} total · {jobs.filter(j => j.status === 'pending').length} pending</div>
      </div>

      <div style={s.filters}>
        {STATUSES.map(st => (
          <button key={st} style={{
            ...s.filterBtn,
            borderColor: filter === st ? (STATUS_COLOR[st] || 'var(--accent)') : 'var(--border2)',
            color: filter === st ? (STATUS_COLOR[st] || 'var(--accent)') : 'var(--muted)',
            background: filter === st ? `${STATUS_COLOR[st] || 'var(--accent)'}15` : 'transparent',
          }} onClick={() => setFilter(st)}>
            {st}
          </button>
        ))}
      </div>

      <div style={s.tableWrap}>
        {loading ? (
          <div style={s.empty}>Loading...</div>
        ) : filtered.length === 0 ? (
          <div style={s.empty}>No jobs found</div>
        ) : (
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>Job ID</th>
                <th style={s.th}>Sender</th>
                <th style={s.th}>From → To</th>
                <th style={s.th}>Item</th>
                <th style={s.th}>Price</th>
                <th style={s.th}>Rider</th>
                <th style={s.th}>Status</th>
                <th style={s.th}>Time</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(job => (
                <tr key={job.id}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  style={{ transition: 'background 0.1s' }}
                >
                  <td style={{ ...s.td, ...s.mono, color: 'var(--muted)' }}>{job.id.slice(0,8).toUpperCase()}</td>
                  <td style={{ ...s.td, ...s.mono }}>{phone(job.sender_phone)}</td>
                  <td style={s.td}>
                    <div style={{ fontSize: '12px' }}>{job.pickup_address}</div>
                    <div style={{ fontSize: '11px', color: 'var(--muted)' }}>→ {job.dropoff_address}</div>
                  </td>
                  <td style={{ ...s.td, fontSize: '12px', color: 'var(--muted)' }}>{job.item_description || '—'}</td>
                  <td style={{ ...s.td, ...s.mono }}>{fmt(job.estimated_price)}</td>
                  <td style={s.td}>
                    {job.riders ? (
                      <div>
                        <div style={{ fontSize: '12px' }}>{job.riders.name}</div>
                        <div style={{ ...s.mono, color: 'var(--muted)' }}>{phone(job.riders.phone)}</div>
                      </div>
                    ) : <span style={{ color: 'var(--muted)' }}>—</span>}
                  </td>
                  <td style={s.td}>
                    <select
                      style={{ ...s.statusSelect, color: STATUS_COLOR[job.status] || 'var(--text)', borderColor: `${STATUS_COLOR[job.status]}44` || 'var(--border2)' }}
                      value={job.status}
                      onChange={e => updateStatus(job.id, e.target.value)}
                    >
                      {['pending','accepted','in_transit','delivered','cancelled'].map(st => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </td>
                  <td style={{ ...s.td, ...s.mono, color: 'var(--muted)' }}>{fmtDate(job.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
