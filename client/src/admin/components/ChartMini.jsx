import React from 'react'

// Simple accessible sparkline chart using SVG
const ChartMini = ({ series = [], width = 160, height = 48, color = 'var(--color-accent)', label = 'Chart' }) => {
  if (!series.length) {
    return <div className="chart-mini chart-mini--empty" aria-label={`${label} (no data)`}>No data</div>
  }
  const max = Math.max(...series)
  const min = Math.min(...series)
  const range = Math.max(1, max - min)
  const stepX = width / (series.length - 1)
  const points = series.map((v, i) => {
    const x = i * stepX
    const y = height - ((v - min) / range) * height
    return `${x},${y}`
  }).join(' ')

  return (
    <svg className="chart-mini" width={width} height={height} role="img" aria-label={label}>
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        points={points}
      />
    </svg>
  )
}

export default ChartMini