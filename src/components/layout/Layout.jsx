import { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'

const nav = [
  { to: '/',       label: 'Dashboard', icon: '▦' },
  { to: '/riders', label: 'Riders',    icon: '🏍' },
  { to: '/jobs',   label: 'Jobs',      icon: '📦' },
  { to: '/stats',  label: 'Stats',     icon: '📊' },
]

const s = {
  root: { display: 'flex', height: '100vh', overflow: 'hidden' },
  sidebar: {
    width: '220px', flexShrink: 0,
    background: 'var(--surface)',
    borderRight: '1px solid var(--border)',
    display: 'flex', flexDirection: 'column',
    padding: '28px 0',
    transition: 'background 0.3s, border-color 0.3s',
  },
  logo: {
    fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 600,
    color: 'var(--accent)', padding: '0 24px', marginBottom: '8px', letterSpacing: '-0.02em',
  },
  logoSub: {
    fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--muted)',
    padding: '0 24px', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '32px',
    transition: 'color 0.3s',
  },
  navItem: {
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '10px 24px', fontSize: '13px', color: 'var(--muted)',
    textDecoration: 'none', borderLeft: '2px solid transparent',
    transition: 'all 0.15s', fontWeight: 400,
  },
  navActive: {
    color: 'var(--accent)', borderLeftColor: 'var(--accent)',
    background: 'rgba(184,245,90,0.05)',
  },
  spacer: { flex: 1 },

  // Theme toggle
  toggleWrap: {
    margin: '0 16px 12px',
    padding: '10px 12px',
    background: 'var(--surface2)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    transition: 'background 0.3s, border-color 0.3s',
  },
  toggleLabel: {
    fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--muted)',
    letterSpacing: '0.08em', textTransform: 'uppercase', transition: 'color 0.3s',
  },
  toggleTrack: {
    width: '36px', height: '20px',
    background: 'var(--border2)', borderRadius: '100px',
    position: 'relative', cursor: 'pointer', border: 'none',
    transition: 'background 0.3s', flexShrink: 0,
  },
  toggleThumb: {
    position: 'absolute', top: '2px',
    width: '16px', height: '16px', borderRadius: '50%',
    background: 'var(--text)',
    transition: 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1), background 0.3s',
  },

  logoutBtn: {
    margin: '0 16px', padding: '9px 16px',
    background: 'transparent', border: '1px solid var(--border)',
    borderRadius: '7px', color: 'var(--muted)', fontSize: '12px',
    cursor: 'pointer', fontFamily: 'var(--font-body)',
    transition: 'all 0.15s', textAlign: 'left',
  },
  main: { flex: 1, overflow: 'auto', background: 'var(--bg)', transition: 'background 0.3s' },
}

export default function Layout({ children, onLogout }) {
  const [theme, setTheme] = useState(
    () => document.documentElement.getAttribute('data-theme') || 'dark'
  )

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('atlas-admin-theme', theme)
  }, [theme])

  const toggle = () => setTheme(t => t === 'dark' ? 'light' : 'dark')
  const isDark = theme === 'dark'

  return (
    <div style={s.root}>
      <aside style={s.sidebar}>
        <div style={s.logo}>Atlas</div>
        <div style={s.logoSub}>Admin Console</div>

        {nav.map(item => (
          <NavLink key={item.to} to={item.to} end={item.to === '/'}
            style={({ isActive }) => ({ ...s.navItem, ...(isActive ? s.navActive : {}) })}>
            <span>{item.icon}</span>{item.label}
          </NavLink>
        ))}

        <div style={s.spacer} />

        {/* Theme toggle */}
        <div style={s.toggleWrap}>
          <span style={s.toggleLabel}>{isDark ? 'Dark' : 'Light'}</span>
          <button style={s.toggleTrack} onClick={toggle} aria-label="Toggle theme">
            <div style={{
              ...s.toggleThumb,
              transform: isDark ? 'translateX(2px)' : 'translateX(18px)',
            }} />
          </button>
        </div>

        <button style={s.logoutBtn} onClick={onLogout}>↩ Sign out</button>
      </aside>

      <main style={s.main}>{children}</main>
    </div>
  )
}
