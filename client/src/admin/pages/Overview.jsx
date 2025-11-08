import React, { useEffect, useState } from 'react'
import KpiCard from '../components/KpiCard'
import ChartMini from '../components/ChartMini'
import { getSystemStatus, getActiveUsers, getPerformanceMetrics } from '../../services/adminMetrics'
import toast from 'react-hot-toast'

export default function Overview() {
  const [status, setStatus] = useState(null)
  const [activeUsers, setActiveUsers] = useState(null)
  const [perf, setPerf] = useState({ p95LatencyMs: null, reqPerMin: null, series: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    async function load() {
      setLoading(true)
      try {
        const [s, u, m] = await Promise.all([
          getSystemStatus().catch(() => null),
          getActiveUsers().catch(() => null),
          getPerformanceMetrics().catch(() => null)
        ])
        if (!alive) return
        setStatus(s)
        setActiveUsers(u)
        setPerf(m || { p95LatencyMs: null, reqPerMin: null, series: [] })
      } catch (e) {
        toast.error('Failed to load dashboard')
      } finally {
        if (alive) setLoading(false)
      }
    }
    load()
    const id = setInterval(load, 30000)
    return () => { alive = false; clearInterval(id) }
  }, [])

  return (
    <div className="admin-overview">
      <header className="admin-section-header">
        <h3>System Overview</h3>
        <p className="muted">Real-time health, usage, and performance metrics</p>
      </header>

      <div className="kpi-grid">
        <KpiCard 
          label="Server Health" 
          value={status?.healthy ? 'Healthy' : (status ? 'Degraded' : 'Unknown')} 
          tone={status?.healthy ? 'success' : status ? 'warning' : 'default'}
          helpText={status?.version ? `v${status.version}` : undefined}
        />
        <KpiCard 
          label="Active Users" 
          value={activeUsers?.count ?? '—'} 
          trend={activeUsers?.trend}
        />
        <KpiCard 
          label="p95 Latency" 
          value={perf?.p95LatencyMs ? `${perf.p95LatencyMs} ms` : '—'}
          trend={perf?.latencyTrend}
        />
        <KpiCard 
          label="Requests/min" 
          value={perf?.reqPerMin ?? '—'}
          trend={perf?.rpmTrend}
        />
      </div>

      <div className="panel-grid">
        <section className="panel" aria-label="Traffic">
          <div className="panel__header"><h4>Traffic</h4></div>
          {loading ? <div className="skeleton" aria-busy="true"/> : (
            <ChartMini series={perf?.series || []} label="Traffic last hour" />
          )}
        </section>
        <section className="panel" aria-label="Recent Events">
          <div className="panel__header"><h4>Recent Events</h4></div>
          <ul className="event-list">
            {(status?.events || []).slice(0,5).map((e, i) => (
              <li key={i} className="event-item">
                <span className={`badge ${e.severity || 'info'}`}>{e.severity || 'info'}</span>
                <span className="event-item__text">{e.message}</span>
              </li>
            ))}
            {(!status?.events?.length) && (
              <li className="event-item muted">No events</li>
            )}
          </ul>
        </section>
      </div>
    </div>
  )
}