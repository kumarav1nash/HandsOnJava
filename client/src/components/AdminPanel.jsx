import { Routes, Route, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import AdminGate from '../admin/AdminGate'

// Lazy pages to keep bundle modular
import Overview from '../admin/pages/Overview'
import Content from '../admin/pages/Content'
import Users from '../admin/pages/Users'
import Analytics from '../admin/pages/Analytics'
import Notifications from '../admin/pages/Notifications'
import Settings from '../admin/pages/Settings'
import Import from '../admin/pages/Import'
import LLMPlayground from '../admin/pages/LLMPlayground'

function AdminLayoutShell() {
  const navigate = useNavigate()

  // Keyboard nav: g then key to go to sections (accessibility/efficiency)
  useEffect(() => {
    const handler = (e) => {
      if (e.key.toLowerCase() === 'g' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        const key = prompt('Go to: o=Overview, u=Users, c=Content, a=Analytics, n=Notifications, s=Settings')
        switch ((key || '').toLowerCase()) {
          case 'o': navigate('/admin'); break
          case 'u': navigate('/admin/users'); break
          case 'c': navigate('/admin/content'); break
          case 'a': navigate('/admin/analytics'); break
          case 'n': navigate('/admin/notifications'); break
          case 's': navigate('/admin/settings'); break
          default: break
        }
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [navigate])

  return (
    <div className="admin-layout" aria-label="Admin dashboard layout">
      <aside className="admin-sidebar" aria-label="Admin Navigation">
        <div className="admin-sidebar__header">
          <h2 className="admin-title">Admin</h2>
        </div>
        <nav className="admin-nav" aria-label="Primary">
          <NavLink end to="/admin" className={({ isActive }) => `admin-nav__item ${isActive ? 'active' : ''}`}>Overview</NavLink>
          <div className="admin-nav__section" aria-label="Management">
            <div className="admin-nav__section-title">Management</div>
            <NavLink to="/admin/users" className={({ isActive }) => `admin-nav__item ${isActive ? 'active' : ''}`}>Users</NavLink>
            <NavLink to="/admin/content" className={({ isActive }) => `admin-nav__item ${isActive ? 'active' : ''}`}>Content</NavLink>
            <NavLink to="/admin/import" className={({ isActive }) => `admin-nav__item ${isActive ? 'active' : ''}`}>Import</NavLink>
            <NavLink to="/admin/playground" className={({ isActive }) => `admin-nav__item ${isActive ? 'active' : ''}`}>LLM Playground</NavLink>
          </div>
          <div className="admin-nav__section" aria-label="Insights">
            <div className="admin-nav__section-title">Insights</div>
            <NavLink to="/admin/analytics" className={({ isActive }) => `admin-nav__item ${isActive ? 'active' : ''}`}>Analytics</NavLink>
            <NavLink to="/admin/notifications" className={({ isActive }) => `admin-nav__item ${isActive ? 'active' : ''}`}>Notifications</NavLink>
          </div>
          <div className="admin-nav__section" aria-label="Settings">
            <div className="admin-nav__section-title">Settings</div>
            <NavLink to="/admin/settings" className={({ isActive }) => `admin-nav__item ${isActive ? 'active' : ''}`}>Audit & Settings</NavLink>
          </div>
        </nav>
      </aside>
      <section className="admin-content" role="region" aria-label="Admin content area">
        <Outlet />
      </section>
    </div>
  )
}

export default function AdminPanel() {
  return (
    <AdminGate>
      <Routes>
        <Route path="/admin" element={<AdminLayoutShell />}> 
          <Route index element={<Overview />} />
        <Route path="users" element={<Users />} />
        <Route path="content" element={<Content />} />
        <Route path="import" element={<Import />} />
        <Route path="playground" element={<LLMPlayground />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </AdminGate>
  )
}