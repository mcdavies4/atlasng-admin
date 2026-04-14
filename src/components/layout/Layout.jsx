import { NavLink } from 'react-router-dom'

const nav = [
  { to: '/',        label: 'Dashboard', icon: '▦' },
  { to: '/riders',  label: 'Riders',    icon: '🏍' },
  { to: '/jobs',    label: 'Jobs',      icon: '📦' },
  { to: '/stats',   label: 'Stats',     icon: '📊' },
]

const s = {
  root: {
    display: 'flex',
    height: '100vh',
    overflow: 'hidden',
  },
  sidebar: {
    width: '220px',
    flexShrink: 0,
    background: 'var(--surface)',
    borderRight: '1px solid var(--border)',
    display: 'flex',
    flexDirection: 'column',
    padding: '28px 0',
  },
  logo: {
    fontFamily: 'var(--font-display)',
    fontSize: '24px',
    fontWeight: 600,
    color: 'var(--accent)',
    padding: '0 24px',
    marginBottom: '8px',
    letterSpacing: '-0.02em',
  },
  logoSub: {
    fontFamily: 'var(--font-mono)',
    fontSize: '9px',
    color: 'var(--muted)',
    padding: '0 24px',
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    marginBottom: '32px',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 24px',
    fontSize: '13px',
    color: 'var(--muted)',
    textDecoration: 'none',
    borderLeft: '2px solid transparent',
    transition: 'all 0.15s',
    fontWeight: 400,
  },
  navActive: {
    color: 'var(--accent)',
    borderLeftColor: 'var(--accent)',
    background: 'rgba(184,245,90,0.05)',
  },
  spacer: { flex: 1 },
  logoutBtn: {
    margin: '0 16px',
    padding: '9px 16px',
    background: 'transparent',
    border: '1px solid var(--border2)',
    borderRadius: '7px',
    color: 'var(--muted)',
    fontSize: '12px',
    cursor: 'pointer',
    fontFamily: 'var(--font-body)',
    transition: 'all 0.15s',
    textAlign: 'left',
  },
  main: {
    flex: 1,
    overflow: 'auto',
    background: 'var(--bg)',
  },
}

export default function Layout({ children, onLogout }) {
  return (
    <div style={s.root}>
      <aside style={s.sidebar}>
        <div style={s.logo}>Atlas</div>
        <div style={s.logoSub}>Admin Console</div>

        {nav.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            style={({ isActive }) => ({
              ...s.navItem,
              ...(isActive ? s.navActive : {}),
            })}
          >
            <span>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}

        <div style={s.spacer} />
        <button style={s.logoutBtn} onClick={onLogout}>↩ Sign out</button>
      </aside>

      <main style={s.main}>{children}</main>
    </div>
  )
}
