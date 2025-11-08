import React from 'react'

const KpiCard = ({ label, value, trend, tone = 'default', helpText }) => {
  return (
    <div className={`kpi-card kpi-card--${tone}`} role="group" aria-label={`${label} KPI`}>
      <div className="kpi-card__label">{label}</div>
      <div className="kpi-card__value" aria-live="polite">{value ?? '—'}</div>
      {trend && (
        <div className={`kpi-card__trend ${trend.delta >= 0 ? 'up' : 'down'}`} aria-label={`Trend ${trend.delta >= 0 ? 'up' : 'down'}`}>
          <span aria-hidden="true">{trend.delta >= 0 ? '▲' : '▼'}</span>
          <span>{Math.abs(trend.delta)}%</span>
        </div>
      )}
      {helpText && <div className="kpi-card__help">{helpText}</div>}
    </div>
  )
}

export default KpiCard