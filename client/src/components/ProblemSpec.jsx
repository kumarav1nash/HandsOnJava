import React from 'react'

export default function ProblemSpec({ problem }) {
  if (!problem) return null

  const samples = Array.isArray(problem.samples) ? problem.samples : []
  const hints = Array.isArray(problem.hints) ? problem.hints : []

  return (
    <div className="problem-spec">
      <div className="card">
        <h4>Statement</h4>
        <p>{problem.statement}</p>
      </div>
      <div className="card">
        <h4>Input</h4>
        <p>{problem.inputSpec}</p>
      </div>
      <div className="card">
        <h4>Output</h4>
        <p>{problem.outputSpec}</p>
      </div>
      <div className="card">
        <h4>Constraints</h4>
        <p>{problem.constraints}</p>
      </div>

      <div className="card">
        <h4>Examples</h4>
        <table className="table" role="table" aria-label="Sample examples">
          <thead>
            <tr>
              <th>Input</th>
              <th>Expected Output</th>
            </tr>
          </thead>
          <tbody>
            {samples.map((s, i) => (
              <tr key={i}>
                <td><code>{String(s.input || '').replace(/\n/g, '\u21B5\u00A0')}</code></td>
                <td><code>{String(s.expectedOutput || '').replace(/\n/g, '\u21B5\u00A0')}</code></td>
              </tr>
            ))}
            {samples.length === 0 && (
              <tr>
                <td colSpan={2} style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>No examples available</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="card">
        <details>
          <summary aria-expanded="false">Hints</summary>
          {hints.length > 0 ? (
            <ul style={{ marginTop: 'var(--space-sm)' }}>
              {hints.map((h, i) => (<li key={i}>{h}</li>))}
            </ul>
          ) : (
            <p style={{ marginTop: 'var(--space-sm)', color: 'var(--color-text-muted)' }}>Hints will be added soon.</p>
          )}
        </details>
      </div>
    </div>
  )
}