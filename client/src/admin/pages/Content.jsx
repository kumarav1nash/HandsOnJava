import React, { useState } from 'react'
import ProblemsPage from '../ProblemsPage'
import TestCasesPage from '../TestCasesPage'

export default function Content() {
  const [problemId, setProblemId] = useState('')

  return (
    <div className="admin-content-page">
      <header className="admin-section-header">
        <h3>Content Management</h3>
        <p className="muted">Manage problems and their test cases</p>
      </header>

      <div className="panel">
        <div className="panel__header">
          <nav className="subtabs" role="tablist" aria-label="Content sections">
            <button className="btn btn--ghost active" disabled>Problems</button>
            <button className="btn btn--ghost" disabled>Test Cases</button>
          </nav>
        </div>
        <div className="panel__content grid-two" aria-live="polite">
          <ProblemsPage problemId={problemId} setProblemId={setProblemId} />
          <TestCasesPage problemId={problemId} />
        </div>
      </div>
    </div>
  )
}