import React from 'react'
import ChartMini from '../components/ChartMini'

export default function Analytics() {
  const seriesA = [10,12,9,14,16,18,15,19,22,18,21,24]
  const seriesB = [4,6,5,7,8,6,5,7,9,8,10,11]
  return (
    <div className="admin-analytics">
      <header className="admin-section-header">
        <h3>Analytics</h3>
        <p className="muted">Traffic, performance and engagement over time</p>
      </header>
      <div className="panel-grid">
        <section className="panel" aria-label="Requests per minute">
          <div className="panel__header"><h4>Requests per minute</h4></div>
          <ChartMini series={seriesA} label="Requests per minute" />
        </section>
        <section className="panel" aria-label="Error rate">
          <div className="panel__header"><h4>Error rate</h4></div>
          <ChartMini series={seriesB} label="Error rate" color="var(--color-danger)" />
        </section>
      </div>
    </div>
  )
}