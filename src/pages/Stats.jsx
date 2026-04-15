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
  statLabel:  { fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--muted)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '10px' },
  statValue:  { fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 300, letterSpacing: '-0.02em', lineHeight: 1, marginBottom: '4px' },
  statSub:    { fontSize: '11px', color: 'var(--muted)' },

  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' },

  card:       { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden', marginBottom: '16px' },
  cardHeader: {
    padding: '16px 20px', borderBottom: '1px solid var(--border)',
    fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--muted)',
    letterSpacing: '0.12em', textTransform: 'uppercase',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  },

  listRow: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '12px 20px', borderBottom: '1px solid var(--border)',
    fontSize: '13px', transition: 'background 0.1s',
  },
  listLabel: { color: 'var(--text)', flex: 1 },
  listCount: { fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--accent)', marginLeft: '12px' },
  listBar:   { height: '4px', borderRadius: '2px', background: 'var(--accent)', marginLeft: '16px', minWidth: '4px', transition: 'width 0.4s ease' },

  empty:   { padding: '32px', textAlign: 'center', color: 'var(--muted)', fontFamily: 'var(--font-mono)', fontSize: '12px' },
  loading: { padding: '32px', textAlign: 'center', color: 'var(--muted)', fontFamily: 'var(--font-mono)', fontSize: '12px' },

  hourGrid: { display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '4px', padding: '20px' },
  hourBar:  { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' },
  hourLabel:{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--muted)' },

  table: { width: '100%', borderCollapse: 'collapse' },
  th: {
    fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--muted)',
    letterSpacing: '0.1em', textTransform: 'uppercase',
    padding: '10px 16px', textAlign: 'left', borderBottom: '1px solid var(--border)',
    background: 'var(--surface2)',
  },
  td:   { padding: '11px 16px', borderBottom: '1px solid var(--border)', fontSize: '12px', verticalAlign: 'middle' },
  mono: { fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--muted)' },

  badge: {
    display: 'inline-block', padding: '2px 8px', borderRadius: '4px',
    fontSize: '10px', fontFamily: 'var(--font-mono)',
  },
  verifyBtn: {
    padding: '4px 10px', borderRadius: '5px',
    border: '1px solid rgba(184,245,90,0.3)',
    background: 'transparent', color: 'var(--accent)',
    fontSize: '10px', cursor: 'pointer',
    fontFamily: 'var(--font-mono)', transition: 'all 0.15s',
  },
  rejectBtn: {
    padding: '4px 10px', borderRadius: '5px',
    border: '1px solid rgba(245,90,90,0.3)',
    background: 'transparent', color: 'var(--danger)',
    fontSize: '10px', cursor: 'pointer',
    fontFamily: 'var(--font-mono)', transition: 'all 0.15s',
    marginLeft: '6px',
  },
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

const STATUS_COLORS = {
  unverified: { bg: 'rgba(245,196,90,0.1)', color: 'var(--warn)' },
  verified:   { bg: 'rgba(184,245,90,0.1)', color: 'var(--accent)' },
  rejected:   { bg: 'rgba(245,90,90,0.1)',  color: 'var(--danger)' },
}

export default function Stats() {
  const [loading, setLoading]       = useState(true)
  const [overview, setOverview]     = useState({ today: 0, week: 0, total: 0, users: 0 })
  const [cities, setCities]         = useState([])
  const [routes, setRoutes]         = useState([])
  const [companies, setCompanies]   = useState([])
  const [selectedCos, setSelectedCos] = useState([])
  const [hours, setHours]           = useState([])
  const [recent, setRecent]         = useState([])
  const [verifiedCos, setVerifiedCos] = useState([])
  const [vcFilter, setVcFilter]     = useState('unverified')

  useEffect(() => { load() }, [])

  async function load() {
    const now     = new Date()
    const today   = new Date(now); today.setHours(0,0,0,0)
    const weekAgo = new Date(now); weekAgo.setDate(weekAgo.getDate() - 7)

    const [searchRes, vcRes] = await Promise.all([
      supabase.from('search_history').select('*').order('created_at', { ascending: false }),
      supabase.from('verified_companies').select('*').order('mention_count', { ascending: false }),
    ])

    const all = searchRes.data || []
    const vc  = vcRes.data || []

    const todayItems  = all.filter(r => new Date(r.created_at) >= today)
    const weekItems   = all.filter(r => new Date(r.created_at) >= weekAgo)
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

    // Top suggested companies (from search results)
    const companyCount = {}
    all.forEach(r => { if (r.top_company) companyCount[r.top_company] = (companyCount[r.top_company] || 0) + 1 })
    setCompanies(Object.entries(companyCount).sort((a,b) => b[1]-a[1]).slice(0,6).map(([label, count]) => ({ label, count })))

    // Top selected companies (actually chosen by users)
    const selectedCount = {}
    all.forEach(r => { if (r.selected_company) selectedCount[r.selected_company] = (selectedCount[r.selected_company] || 0) + 1 })
    setSelectedCos(Object.entries(selectedCount).sort((a,b) => b[1]-a[1]).slice(0,6).map(([label, count]) => ({ label, count })))

    // Hours
    const hourCount = Array(24).fill(0)
    weekItems.forEach(r => { hourCount[new Date(r.created_at).getHours()]++ })
    setHours(hourCount)

    setRecent(all.slice(0, 12))
    setVerifiedCos(vc)
    setLoading(false)
  }

  async function updateVcStatus(id, status) {
    await supabase.from('verified_companies').update({ status }).eq('id', id)
    load()
  }

  const maxCity      = Math.max(...cities.map(c => c.count), 1)
  const maxRoute     = Math.max(...routes.map(r => r.count), 1)
  const maxCompany   = Math.max(...companies.map(c => c.count), 1)
  const maxSelected  = Math.max(...selectedCos.map(c => c.count), 1)
  const maxHour      = Math.max(...hours, 1)

  const fmtDate  = (d) => new Date(d).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
  const fmtPhone = (p) => p ? p.replace(/^(\d{3})(\d+)(\d{3})$/, '$1•••$3') : '—'

  const filteredVc = verifiedCos.filter(c => vcFilter === 'all' || c.status === vcFilter)

  if (loading) return <div style={{ ...s.page, ...s.loading }}>Loading stats...</div>

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div style={s.title}>Usage Stats</div>
        <div style={s.subtitle}>Atlas Agent — search, engagement and company analytics</div>
      </div>

      {/* Overview */}
      <div style={s.statsGrid}>
        <StatCard delay={1} label="Searches Today"    value={overview.today}  sub="last 24 hrs"      color="var(--accent)" />
        <StatCard delay={2} label="Searches This Week" value={overview.week}  sub="last 7 days"      color="var(--accent2)" />
        <StatCard delay={3} label="Total Searches"    value={overview.total}  sub="all time"         color="var(--accent3)" />
        <StatCard delay={4} label="Unique Users"      value={overview.users}  sub="distinct numbers" color="var(--accent4)" />
      </div>

      {/* Cities + Routes */}
      <div style={s.grid2}>
        <div style={s.card} className="fade-up">
          <div style={s.cardHeader}><span>Top Cities</span><span>{cities.length} cities</span></div>
          <BarList items={cities} max={maxCity} />
        </div>
        <div style={s.card} className="fade-up">
          <div style={s.cardHeader}><span>Top Routes</span><span>{routes.length} routes</span></div>
          <BarList items={routes} max={maxRoute} />
        </div>
      </div>

      {/* Suggested vs Actually Selected */}
      <div style={s.grid2}>
        <div style={s.card} className="fade-up">
          <div style={s.cardHeader}><span>Most Suggested by Atlas</span><span>from results</span></div>
          <BarList items={companies} max={maxCompany} />
        </div>
        <div style={s.card} className="fade-up">
          <div style={s.cardHeader}><span>Actually Chosen by Users</span><span>pitch targets ⭐</span></div>
          {selectedCos.length === 0
            ? <div style={s.empty}>No selections captured yet</div>
            : <BarList items={selectedCos} max={maxSelected} />
          }
        </div>
      </div>

      {/* Peak hours */}
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
                minHeight: '2px',
              }} />
              <div style={s.hourLabel}>{h % 6 === 0 ? `${h}h` : ''}</div>
            </div>
          ))}
        </div>
      </div>

      {/* User-reported companies */}
      <div style={s.card} className="fade-up">
        <div style={s.cardHeader}>
          <span>User-Reported Companies</span>
          <div style={{ display: 'flex', gap: '6px' }}>
            {['unverified', 'verified', 'rejected', 'all'].map(f => (
              <button key={f} onClick={() => setVcFilter(f)} style={{
                padding: '3px 10px', borderRadius: '4px', border: '1px solid',
                borderColor: vcFilter === f ? 'var(--accent)' : 'var(--border2)',
                background:  vcFilter === f ? 'rgba(184,245,90,0.1)' : 'transparent',
                color:       vcFilter === f ? 'var(--accent)' : 'var(--muted)',
                fontSize: '10px', cursor: 'pointer', fontFamily: 'var(--font-mono)',
              }}>{f}</button>
            ))}
          </div>
        </div>
        {filteredVc.length === 0 ? (
          <div style={s.empty}>No companies reported yet</div>
        ) : (
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>Company</th>
                <th style={s.th}>Phone</th>
                <th style={s.th}>City</th>
                <th style={s.th}>Route</th>
                <th style={s.th}>Mentions</th>
                <th style={s.th}>Status</th>
                <th style={s.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredVc.map(c => (
                <tr key={c.id}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  style={{ transition: 'background 0.1s' }}
                >
                  <td style={{ ...s.td, fontWeight: 500 }}>{c.name}</td>
                  <td style={{ ...s.td, ...s.mono }}>{c.phone || '—'}</td>
                  <td style={{ ...s.td, ...s.mono }}>{c.city || '—'}</td>
                  <td style={{ ...s.td, fontSize: '11px', color: 'var(--muted)' }}>
                    {c.route_pickup && c.route_dropoff ? `${c.route_pickup} → ${c.route_dropoff}` : '—'}
                  </td>
                  <td style={{ ...s.td, ...s.mono, color: 'var(--accent)' }}>{c.mention_count}x</td>
                  <td style={s.td}>
                    <span style={{
                      ...s.badge,
                      ...STATUS_COLORS[c.status] || STATUS_COLORS.unverified,
                    }}>{c.status}</span>
                  </td>
                  <td style={s.td}>
                    {c.status !== 'verified' && (
                      <button style={s.verifyBtn} onClick={() => updateVcStatus(c.id, 'verified')}>
                        ✓ Verify
                      </button>
                    )}
                    {c.status !== 'rejected' && (
                      <button style={s.rejectBtn} onClick={() => updateVcStatus(c.id, 'rejected')}>
                        ✕
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Recent searches */}
      <div style={s.card} className="fade-up">
        <div style={s.cardHeader}><span>Recent Searches</span><span>{overview.total} total</span></div>
        {recent.length === 0 ? (
          <div style={s.empty}>No searches yet</div>
        ) : (
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>User</th>
                <th style={s.th}>From</th>
                <th style={s.th}>To</th>
                <th style={s.th}>City</th>
                <th style={s.th}>Suggested</th>
                <th style={s.th}>Selected</th>
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
                  <td style={{ ...s.td, fontSize: '12px', color: 'var(--muted)' }}>{r.top_company || '—'}</td>
                  <td style={{ ...s.td, fontSize: '12px', color: 'var(--accent)' }}>
                    {r.selected_company || '—'}
                  </td>
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
