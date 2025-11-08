import React, { useEffect, useState } from 'react'
import { getNotifications } from '../../services/adminMetrics'

export default function Notifications() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    async function load() {
      setLoading(true)
      try {
        const data = await getNotifications()
        if (!alive) return
        setItems(Array.isArray(data) ? data : [])
      } finally {
        if (alive) setLoading(false)
      }
    }
    load()
    return () => { alive = false }
  }, [])

  return (
    <div className="admin-notifications">
      <header className="admin-section-header">
        <h3>Notifications</h3>
        <p className="muted">Alerts and system notifications</p>
      </header>
      <div className="panel">
        <div className="panel__header"><h4>Recent alerts</h4></div>
        <div className="panel__content">
          {loading ? (
            <div className="skeleton" aria-busy="true" />
          ) : (
            <ul className="event-list">
              {items.map((n, i) => (
                <li key={i} className="event-item">
                  <span className={`badge ${n.severity || 'info'}`}>{n.severity || 'info'}</span>
                  <span className="event-item__text">{n.message}</span>
                </li>
              ))}
              {items.length === 0 && (
                <li className="event-item muted">No notifications</li>
              )}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}