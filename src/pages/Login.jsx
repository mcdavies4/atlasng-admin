import { useState } from 'react'

const styles = {
  wrap: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--bg)',
    position: 'relative',
    overflow: 'hidden',
  },
  grid: {
    position: 'absolute',
    inset: 0,
    backgroundImage: `linear-gradient(var(--border) 1px, transparent 1px),
                      linear-gradient(90deg, var(--border) 1px, transparent 1px)`,
    backgroundSize: '48px 48px',
    opacity: 0.4,
  },
  card: {
    position: 'relative',
    zIndex: 1,
    background: 'var(--surface)',
    border: '1px solid var(--border2)',
    borderRadius: '16px',
    padding: '48px',
    width: '100%',
    maxWidth: '400px',
    animation: 'fadeUp 0.5s ease both',
  },
  logo: {
    fontFamily: 'var(--font-display)',
    fontSize: '32px',
    fontWeight: 600,
    color: 'var(--accent)',
    marginBottom: '4px',
    letterSpacing: '-0.02em',
  },
  sub: {
    fontSize: '12px',
    color: 'var(--muted)',
    fontFamily: 'var(--font-mono)',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    marginBottom: '36px',
  },
  label: {
    display: 'block',
    fontSize: '11px',
    fontFamily: 'var(--font-mono)',
    color: 'var(--muted)',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    marginBottom: '8px',
  },
  input: {
    width: '100%',
    background: 'var(--bg)',
    border: '1px solid var(--border2)',
    borderRadius: '8px',
    padding: '12px 14px',
    color: 'var(--text)',
    fontFamily: 'var(--font-mono)',
    fontSize: '14px',
    outline: 'none',
    marginBottom: '24px',
    transition: 'border-color 0.2s',
  },
  btn: {
    width: '100%',
    background: 'var(--accent)',
    color: 'var(--bg)',
    border: 'none',
    borderRadius: '8px',
    padding: '13px',
    fontFamily: 'var(--font-body)',
    fontWeight: 500,
    fontSize: '14px',
    cursor: 'pointer',
    letterSpacing: '0.02em',
    transition: 'opacity 0.2s',
  },
  error: {
    marginTop: '14px',
    fontSize: '12px',
    color: 'var(--danger)',
    textAlign: 'center',
    fontFamily: 'var(--font-mono)',
  },
}

export default function Login({ onLogin }) {
  const [pw, setPw] = useState('')
  const [err, setErr] = useState(false)

  const attempt = () => {
    if (pw === import.meta.env.VITE_ADMIN_PASSWORD) {
      onLogin()
    } else {
      setErr(true)
      setTimeout(() => setErr(false), 2000)
    }
  }

  return (
    <div style={styles.wrap}>
      <div style={styles.grid} />
      <div style={styles.card}>
        <div style={styles.logo}>Atlas</div>
        <div style={styles.sub}>Admin Console</div>
        <label style={styles.label}>Password</label>
        <input
          style={styles.input}
          type="password"
          value={pw}
          onChange={e => setPw(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && attempt()}
          placeholder="••••••••"
          autoFocus
        />
        <button style={styles.btn} onClick={attempt}>Enter</button>
        {err && <div style={styles.error}>Incorrect password</div>}
      </div>
    </div>
  )
}
