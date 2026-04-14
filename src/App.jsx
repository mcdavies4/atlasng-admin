import React, { Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Login from './pages/Login'
import Layout from './components/layout/Layout'
import Dashboard from './pages/Dashboard'
import Riders from './pages/Riders'
import Jobs from './pages/Jobs'
import Stats from './pages/Stats'

function App() {
  const [authed, setAuthed] = useState(() => {
    return sessionStorage.getItem('atlas_admin') === 'true'
  })

  const handleLogin = () => {
    sessionStorage.setItem('atlas_admin', 'true')
    setAuthed(true)
  }

  const handleLogout = () => {
    sessionStorage.removeItem('atlas_admin')
    setAuthed(false)
  }

  if (!authed) return <Login onLogin={handleLogin} />

  return (
    <Layout onLogout={handleLogout}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/riders" element={<Riders />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/stats" element={<Stats />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Layout>
  )
}

export default App
