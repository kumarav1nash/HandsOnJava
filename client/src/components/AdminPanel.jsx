import { useState } from 'react'
import AdminGate from '../admin/AdminGate'
import ProblemsPage from '../admin/ProblemsPage'
import TestCasesPage from '../admin/TestCasesPage'

export default function AdminPanel() {
  const [problemId, setProblemId] = useState('')
  const [active, setActive] = useState('Problems')

  return (
    <AdminGate>
      <div className="pane" aria-label="Admin Panel">
        <div className="pane__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 className="pane__title">Admin</h2>
          <div role="tablist" aria-label="Admin sections" style={{ display: 'flex', gap: 'var(--space-sm)' }}>
            <button className={`btn btn--ghost ${active === 'Problems' ? 'active' : ''}`} role="tab" aria-selected={active === 'Problems'} onClick={() => setActive('Problems')}>Problems</button>
            <button className={`btn btn--ghost ${active === 'TestCases' ? 'active' : ''}`} role="tab" aria-selected={active === 'TestCases'} onClick={() => setActive('TestCases')} disabled={!problemId}>Test Cases</button>
          </div>
        </div>

        {active === 'Problems' ? (
          <ProblemsPage problemId={problemId} setProblemId={setProblemId} />
        ) : (
          <TestCasesPage problemId={problemId} />
        )}
      </div>
    </AdminGate>
  )
}