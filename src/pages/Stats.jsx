import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const s = {
  page:     { padding: '36px 40px' },
  header:   { marginBottom: '32px' },
  title:    { fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 600, letterSpacing: '-0.02em', marginBottom: '4px' },
  subtitle: { fontSize: '13px', color: 'var(--muted)' },

  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' },
  stat: {
    background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: '12px', padding: '20px 22px', position: 'relative', overflow: 'hidden',
  },
  statAccent: { position: 'absolute', top: 0, left: 0, right: 0, height: '2px' },
  statLabel: { fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--muted)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '10px' },
  statValue: { fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 300, letterSpacing: '-0.02em', lineHeight: 1, marginBottom: '4px' },
  statSub:   { fontSize: '11px', color: 'var(--muted)' },

  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' },
  grid3: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' },

  card: { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' },
  cardHeader: {
    padding: '16px 20px', borderBottom: '1px solid var(--border)',
    fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--muted)',
    letterSpacing: '0.12em', textTransform: 'uppercase',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  },
  cardBody: { padding: '0' },

  listRow: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '12px 20px', borderBottom: '1px solid var(--border)',
    fontSize: '13px', transition: 'background 0.1s',
  },
  listLabel: { color: 'var(--text)', flex: 1 },
  listCount: { fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--accent)', marginLeft: '12px' },
  listBar: { height: '4px', borderRadius: '2px', background: 'var(--accent)', marginLeft: '16px', minWidth: '4px', transition: 'width 0.4s ease' },

  empty:    { padding: '32px', textAlign: 'center', color: 'var(--muted)', fontFamily: 'var(--font-mono)', fontSize: '12px' },
  loading:  { padding: '32px', textAlign: 'center', color: 'var(--muted)', fontFamily: 'var(--font-mono)', fontSize: '12px' },

  hourGrid: { display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '4px', padding: '20px' },
  hourBar: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' },
  hourLabel: { fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--muted)' },

  recentTable: { width: '100%', borderCollapse: 'collapse' },
  th: {
    fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--muted)',
    letterSpacing: '0.1em', textTransform: 'uppercase',
    padding: '10px 16px', textAlign: 'left', borderBottom: '1px solid var(--border)',
  },
  td: { padding: '11px 16px', borderBottom: '1px solid var(--border)', fontSize: '12px', verticalAlign: 'middle' },
  mono: { fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--muted)' },
}

function StatCard({ label, value, sub, color, delay }) {
  return (
    <div style={s.stat} className={`fade-up fade-up-${delay}`}>
      <div style={{ ...s.statAccent, background: color || 'var(--accent)' }} />
      <div style={s.statLabel}>{label}</div>
      <div style={s.statValue}>{value}</div>
      {sub && <div style={s.statSub}>{sub}</div>}
    </div>
  )
}

function BarList({ items, max }) {
  if (!items || items.length === 0) return <div style={s.empty}>No data yet</div>
  return items.map((item, i) => (
    <div key={i} style={s.listRow}
      onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      <span style={s.listLabel}>{item.label}</span>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{ ...s.listBar, width: `${Math.max(4, (item.count / max) * 80)}px` }} />
        <span style={s.listCount}>{item.count}</span>
      </div>
    </div>
  ))
}

export default function Stats() {
  const [loading, setLoading]   = useState(true)
  const [overview, setOverview] = useState({ today: 0, week: 0, total: 0, users: 0 })
  const [cities, setCities]     = useState([])
  const [routes, setRoutes]     = useState([])
  const [companies, setCompanies] = useState([])
  const [hours, setHours]       = useState([])
  const [recent, setRecent]     = useState([])

  useEffect(() => { load() }, [])

  async function load() {
    const now     = new Date()
    const today   = new Date(now); today.setHours(0,0,0,0)
    const weekAgo = new Date(now); weekAgo.setDate(weekAgo.getDate() - 7)

    const { data: all } = await supabase
      .from('search_history')
      .select('*')
      .order('created_at', { ascending: false })

    if (!all) { setLoading(false); return }

    const todayItems = all.filter(r => new Date(r.created_at) >= today)
    const weekItems  = all.filter(r => new Date(r.created_at) >= weekAgo)
    const uniqueUsers = new Set(all.map(r => r.phone)).size

    setOverview({ today: todayItems.length, week: weekItems.length, total: all.length, users: uniqueUsers })

    // Cities
    const cityCount = {}
    all.forEach(r => { if (r.city) cityCount[r.city] = (cityCount[r.city] || 0) + 1 })
    setCities(Object.entries(cityCount).sort((a,b) => b[1]-a[1]).slice(0,6).map(([label, count]) => ({ label, count })))

    // Routes
    const routeCount = {}
    all.forEach(r => {
      if (r.pickup && r.dropoff) {
        const key = `${r.pickup} → ${r.dropoff}`
        routeCount[key] = (routeCount[key] || 0) + 1
      }
    })
    setRoutes(Object.entries(routeCount).sort((a,b) => b[1]-a[1]).slice(0,6).map(([label, count]) => ({ label, count })))

    // Top companies
    const companyCount = {}
    all.forEach(r => { if (r.top_company) companyCount[r.top_company] = (companyCount[r.top_company] || 0) + 1 })
    setCompanies(Object.entries(companyCount).sort((a,b) => b[1]-a[1]).slice(0,6).map(([label, count]) => ({ label, count })))

    // Hours (last 7 days)
    const hourCount = Array(24).fill(0)
    weekItems.forEach(r => { hourCount[new Date(r.created_at).getHours()]++ })
    setHours(hourCount)

    // Recent
    setRecent(all.slice(0, 12))
    setLoading(false)
  }

  const maxCity    = Math.max(...cities.map(c => c.count), 1)
  const maxRoute   = Math.max(...routes.map(r => r.count), 1)
  const maxCompany = Math.max(...companies.map(c => c.count), 1)
  const maxHour    = Math.max(...hours, 1)

  const fmtDate = (d) => new Date(d).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
  const fmtPhone = (p) => p ? p.replace(/^(\d{3})(\d+)(\d{3})$/, '$1•••$3') : '—'

  if (loading) return <div style={{ ...s.page, ...s.loading }}>Loading stats...</div>

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div style={s.title}>Usage Stats</div>
        <div style={s.subtitle}>Atlas Agent — search and engagement analytics</div>
      </div>

      {/* Overview */}
      <div style={s.statsGrid}>
        <StatCard delay={1} label="Searches Today"   value={overview.today} sub="last 24 hrs"     color="var(--accent)" />
        <StatCard delay={2} label="Searches This Week" value={overview.week} sub="last 7 days"    color="var(--accent2)" />
        <StatCard delay={3} label="Total Searches"   value={overview.total} sub="all time"        color="var(--accent3)" />
        <StatCard delay={4} label="Unique Users"     value={overview.users} sub="distinct numbers" color="var(--accent4)" />
      </div>

      {/* Cities + Routes */}
      <div style={s.grid2}>
        <div style={s.card} className="fade-up">
          <div style={s.cardHeader}><span>Top Cities</span><span>{cities.length} cities</span></div>
          <div style={s.cardBody}><BarList items={cities} max={maxCity} /></div>
        </div>
        <div style={s.card} className="fade-up">
          <div style={s.cardHeader}><span>Top Routes</span><span>{routes.length} routes</span></div>
          <div style={s.cardBody}><BarList items={routes} max={maxRoute} /></div>
        </div>
      </div>

      {/* Companies + Hours */}
      <div style={s.grid2}>
        <div style={s.card} className="fade-up">
          <div style={s.cardHeader}><span>Most Suggested Companies</span></div>
          <div style={s.cardBody}><BarList items={companies} max={maxCompany} /></div>
        </div>

        <div style={s.card} className="fade-up">
          <div style={s.cardHeader}><span>Peak Hours (Last 7 Days)</span></div>
          <div style={s.hourGrid}>
            {hours.slice(0, 24).map((count, h) => (
              <div key={h} style={s.hourBar}>
                <div style={{
                  width: '100%',
                  height: `${Math.max(2, (count / maxHour) * 48)}px`,
                  background: count > 0 ? 'var(--accent)' : 'var(--border)',
                  borderRadius: '3px',
                  opacity: count > 0 ? 0.7 + (count / maxHour) * 0.3 : 0.3,
                  transition: 'height 0.4s ease',
                  minHeight: '2px',
                }} />
                <div style={s.hourLabel}>{h % 6 === 0 ? `${h}h` : ''}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent searches */}
      <div style={s.card} className="fade-up">
        <div style={s.cardHeader}><span>Recent Searches</span><span>{overview.total} total</span></div>
        {recent.length === 0 ? (
          <div style={s.empty}>No searches yet</div>
        ) : (
          <table style={s.recentTable}>
            <thead>
              <tr>
                <th style={s.th}>User</th>
                <th style={s.th}>From</th>
                <th style={s.th}>To</th>
                <th style={s.th}>City</th>
                <th style={s.th}>Item</th>
                <th style={s.th}>Top Result</th>
                <th style={s.th}>Time</th>
              </tr>
            </thead>
            <tbody>
              {recent.map(r => (
                <tr key={r.id}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  style={{ transition: 'background 0.1s' }}
                >
                  <td style={{ ...s.td, ...s.mono }}>{fmtPhone(r.phone)}</td>
                  <td style={s.td}>{r.pickup || '—'}</td>
                  <td style={s.td}>{r.dropoff || '—'}</td>
                  <td style={{ ...s.td, ...s.mono }}>{r.city || '—'}</td>
                  <td style={{ ...s.td, color: 'var(--muted)', fontSize: '11px' }}>{r.item_description || '—'}</td>
                  <td style={{ ...s.td, fontSize: '12px' }}>{r.top_company || '—'}</td>
                  <td style={{ ...s.td, ...s.mono }}>{fmtDate(r.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
