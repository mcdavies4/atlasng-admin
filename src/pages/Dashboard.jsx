import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { formatAmount } from '../lib/currency'

const s = {
  page: { padding: '36px 40px' },
  header: { marginBottom: '32px' },
  title: {
    fontFamily: 'var(--font-display)',
    fontSize: '28px',
    fontWeight: 600,
    letterSpacing: '-0.02em',
    marginBottom: '4px',
  },
  subtitle: { fontSize: '13px', color: 'var(--muted)' },

  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '16px',
    marginBottom: '36px',
  },
  stat: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    padding: '20px 22px',
    position: 'relative',
    overflow: 'hidden',
  },
  statAccent: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: '2px',
    background: 'var(--accent)',
  },
  statLabel: {
    fontFamily: 'var(--font-mono)',
    fontSize: '10px',
    color: 'var(--muted)',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    marginBottom: '10px',
  },
  statValue: {
    fontFamily: 'var(--font-display)',
    fontSize: '32px',
    fontWeight: 300,
    letterSpacing: '-0.02em',
    lineHeight: 1,
    marginBottom: '6px',
  },
  statSub: { fontSize: '11px', color: 'var(--muted)' },

  section: { marginBottom: '32px' },
  sectionTitle: {
    fontFamily: 'var(--font-mono)',
    fontSize: '11px',
    color: 'var(--muted)',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    marginBottom: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  sectionLine: { flex: 1, height: '1px', background: 'var(--border)' },

  table: { width: '100%', borderCollapse: 'collapse' },
  th: {
    fontFamily: 'var(--font-mono)',
    fontSize: '10px',
    color: 'var(--muted)',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    padding: '8px 14px',
    textAlign: 'left',
    borderBottom: '1px solid var(--border)',
  },
  td: {
    padding: '12px 14px',
    borderBottom: '1px solid var(--border)',
    fontSize: '13px',
    verticalAlign: 'middle',
  },
  tableWrap: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    overflow: 'hidden',
  },
  mono: { fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--muted)' },
  empty: {
    padding: '40px',
    textAlign: 'center',
    color: 'var(--muted)',
    fontFamily: 'var(--font-mono)',
    fontSize: '12px',
  },
  dot: {
    display: 'inline-block',
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    marginRight: '7px',
  },
}

const STATUS_COLOR = {
  pending:    '#f5c45a',
  accepted:   '#5ab4f5',
  in_transit: '#b8f55a',
  delivered:  '#6b7560',
  cancelled:  '#f55a5a',
}

function StatCard({ label, value, sub, delay }) {
  return (
    <div style={s.stat} className={`fade-up fade-up-${delay}`}>
      <div style={s.statAccent} />
      <div style={s.statLabel}>{label}</div>
      <div style={s.statValue}>{value}</div>
      {sub && <div style={s.statSub}>{sub}</div>}
    </div>
  )
}

export default function Dashboard() {
  const [stats, setStats] = useState({ today: 0, riders: 0, revenue: 0, total: 0 })
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    load()
    // Realtime subscription for new jobs
    const channel = supabase
      .channel('deliveries')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'deliveries' }, load)
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [])

  async function load() {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const [deliveriesRes, ridersRes, recentRes] = await Promise.all([
      supabase.from('deliveries').select('estimated_price, created_at, status'),
      supabase.from('riders').select('id, is_available').eq('verified', true),
      supabase.from('deliveries').select('*').order('created_at', { ascending: false }).limit(10),
    ])

    const all = deliveriesRes.data || []
    const todayJobs = all.filter(d => new Date(d.created_at) >= today)
    const revenue = todayJobs.reduce((sum, d) => sum + (d.estimated_price || 0), 0)
    const activeRiders = (ridersRes.data || []).filter(r => r.is_available).length

    setStats({
      today:  todayJobs.length,
      riders: activeRiders,
      revenue,
      total:  all.length,
    })
    setJobs(recentRes.data || [])
    setLoading(false)
  }

  const fmt = (n) => formatAmount(n)
  const fmtDate = (d) => new Date(d).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div style={s.title}>Overview</div>
        <div style={s.subtitle}>Real-time Atlas dispatch metrics</div>
      </div>

      <div style={s.statsGrid}>
        <StatCard delay={1} label="Deliveries Today"  value={stats.today}   sub="bookings" />
        <StatCard delay={2} label="Active Riders"     value={stats.riders}  sub="online now" />
        <StatCard delay={3} label="Revenue Today"     value={fmt(stats.revenue)} sub="estimated" />
        <StatCard delay={4} label="Total Deliveries"  value={stats.total}   sub="all time" />
      </div>

      <div style={s.section} className="fade-up fade-up-4">
        <div style={s.sectionTitle}>
          Recent Jobs
          <div style={s.sectionLine} />
        </div>
        <div style={s.tableWrap}>
          {loading ? (
            <div style={s.empty}>Loading...</div>
          ) : jobs.length === 0 ? (
            <div style={s.empty}>No deliveries yet</div>
          ) : (
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>Job ID</th>
                  <th style={s.th}>From</th>
                  <th style={s.th}>To</th>
                  <th style={s.th}>Item</th>
                  <th style={s.th}>Price</th>
                  <th style={s.th}>Status</th>
                  <th style={s.th}>Time</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map(job => (
                  <tr key={job.id} style={{ transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ ...s.td, ...s.mono }}>{job.id.slice(0, 8).toUpperCase()}</td>
                    <td style={s.td}>{job.pickup_address}</td>
                    <td style={s.td}>{job.dropoff_address}</td>
                    <td style={{ ...s.td, color: 'var(--muted)', fontSize: '12px' }}>{job.item_description || '—'}</td>
                    <td style={{ ...s.td, fontFamily: 'var(--font-mono)', fontSize: '12px' }}>{fmt(job.estimated_price)}</td>
                    <td style={s.td}>
                      <span>
                        <span style={{ ...s.dot, background: STATUS_COLOR[job.status] || '#888' }} />
                        {job.status}
                      </span>
                    </td>
                    <td style={{ ...s.td, ...s.mono }}>{fmtDate(job.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
