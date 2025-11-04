import { useEffect, useState, useCallback } from 'react'
import { listTestCases, addTestCase, deleteAllTestCases } from '../services/adminApi'
import toast from 'react-hot-toast'

export default function TestCasesPage({ problemId }) {
  const [tests, setTests] = useState([])
  const [tc, setTc] = useState({ input: '', expectedOutput: '', sample: true })

  const loadTests = useCallback(async () => {
    if (!problemId) { setTests([]); return }
    try {
      const data = await listTestCases(problemId)
      setTests(data)
    } catch (e) {
      console.error(e)
      toast.error('Failed to load test cases')
    }
  }, [problemId])

  useEffect(() => { loadTests() }, [loadTests])

  const onAddTc = async () => {
    try {
      await addTestCase(problemId, tc)
      toast.success('Test case added')
      setTc({ input: '', expectedOutput: '', sample: true })
      await loadTests()
    } catch (e) {
      console.error(e)
      toast.error('Failed to add test case')
    }
  }

  const onDeleteAllTc = async () => {
    try {
      await deleteAllTestCases(problemId)
      toast.success('All test cases deleted')
      await loadTests()
    } catch (e) {
      console.error(e)
      toast.error('Failed to delete all test cases')
    }
  }

  return (
    <section>
      <h2>Test Cases</h2>
      <div className="grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-lg)' }}>
        <div>
          <label htmlFor="input">Input</label>
          <input id="input" className="input" value={tc.input} onChange={(e) => setTc({ ...tc, input: e.target.value })} />
        </div>
        <div>
          <label htmlFor="expectedOutput">Expected Output</label>
          <input id="expectedOutput" className="input" value={tc.expectedOutput} onChange={(e) => setTc({ ...tc, expectedOutput: e.target.value })} />
        </div>
        <div style={{ display: 'flex', alignItems: 'end' }}>
          <label style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center' }}>
            <input type="checkbox" checked={tc.sample} onChange={(e) => setTc({ ...tc, sample: e.target.checked })} /> Sample
          </label>
        </div>
      </div>
      <div style={{ marginTop: 'var(--space-lg)', display: 'flex', gap: 'var(--space-md)' }}>
        <button className="btn" onClick={onAddTc} disabled={!problemId}>Add Test Case</button>
        <button className="btn btn--danger" onClick={onDeleteAllTc} disabled={!problemId}>Delete All Test Cases</button>
        <button className="btn btn--ghost" onClick={loadTests} disabled={!problemId}>Refresh</button>
      </div>

      <div style={{ marginTop: 'var(--space-lg)' }}>
        <table className="table" role="table" aria-label="Test cases">
          <thead>
            <tr>
              <th>Sample</th>
              <th>Input</th>
              <th>Expected Output</th>
            </tr>
          </thead>
          <tbody>
            {tests.map((t, i) => (
              <tr key={i}>
                <td>{String(t.sample ?? t.isSample ?? false)}</td>
                <td><code>{t.input}</code></td>
                <td><code>{t.expectedOutput}</code></td>
              </tr>
            ))}
            {tests.length === 0 && (
              <tr>
                <td colSpan={3} style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>No test cases</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}