import { useState, useEffect, useCallback } from 'react'
import { createProblem, updateProblem, deleteProblem, listTestCases, addTestCase, deleteAllTestCases } from '../services/adminApi'
import { listProblems, getProblem } from '../services/problemsClient'
import toast from 'react-hot-toast'

export default function AdminPanel() {
  const [problemId, setProblemId] = useState('')
  const [problem, setProblem] = useState({ id: '', title: '', statement: '', inputSpec: '', outputSpec: '', constraints: '' })
  const [problems, setProblems] = useState([])
  const [tests, setTests] = useState([])
  const [tc, setTc] = useState({ input: '', expectedOutput: '', sample: true })
  const [errors, setErrors] = useState({})

  const canAdmin = Boolean(import.meta.env.VITE_ADMIN_TOKEN)

  useEffect(() => {
    setProblem(p => ({ ...p, id: problemId }))
    if (problemId) {
      listAll()
    } else {
      setTests([])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [problemId])

  useEffect(() => {
    // Load existing problems to aid selection
    (async () => {
      try {
        const data = await listProblems()
        setProblems(data)
      } catch (e) {
        console.error(e)
      }
    })()
  }, [])

  const listAll = useCallback(async () => {
    try {
      const data = await listTestCases(problemId)
      setTests(data)
    } catch (e) {
      console.error(e)
      toast.error('Failed to load test cases')
    }
  }, [problemId])

  const loadProblemDetails = useCallback(async (id) => {
    try {
      const data = await getProblem(id)
      setProblem({
        id: data?.id || id,
        title: data?.title || '',
        statement: data?.statement || '',
        inputSpec: data?.inputSpec || '',
        outputSpec: data?.outputSpec || '',
        constraints: data?.constraints || ''
      })
    } catch (e) {
      setProblem(p => ({ ...p, id }))
    }
  }, [])

  const validateProblem = useCallback((p) => {
    const errs = {}
    if (!p.id?.trim()) errs.id = 'Problem ID is required'
    if (!p.title?.trim()) errs.title = 'Title is required'
    if (!p.statement?.trim()) errs.statement = 'Statement is required'
    return errs
  }, [])

  useEffect(() => {
    setErrors(validateProblem(problem))
  }, [problem, validateProblem])

  const onCreate = async () => {
    try {
      const errs = validateProblem(problem)
      if (Object.keys(errs).length) {
        setErrors(errs)
        toast.error('Please fix form errors')
        return
      }
      await createProblem(problem)
      toast.success('Problem created/updated')
    } catch (e) {
      console.error(e)
      toast.error('Failed to create problem')
    }
  }

  const onUpdate = async () => {
    try {
      const errs = validateProblem(problem)
      if (Object.keys(errs).length) {
        setErrors(errs)
        toast.error('Please fix form errors')
        return
      }
      await updateProblem(problem.id, problem)
      toast.success('Problem updated')
    } catch (e) {
      console.error(e)
      toast.error('Failed to update problem')
    }
  }

  const onDelete = async () => {
    try {
      await deleteProblem(problemId)
      toast.success('Problem deleted')
      setProblemId('')
      setProblem({ id: '', title: '', statement: '', inputSpec: '', outputSpec: '', constraints: '' })
      setTests([])
    } catch (e) {
      console.error(e)
      toast.error('Failed to delete problem')
    }
  }

  const onAddTc = async () => {
    try {
      await addTestCase(problemId, tc)
      toast.success('Test case added')
      setTc({ input: '', expectedOutput: '', sample: true })
      await listAll()
    } catch (e) {
      console.error(e)
      toast.error('Failed to add test case')
    }
  }

  const onDeleteAllTc = async () => {
    try {
      await deleteAllTestCases(problemId)
      toast.success('All test cases deleted')
      await listAll()
    } catch (e) {
      console.error(e)
      toast.error('Failed to delete all test cases')
    }
  }

  return (
    <div className="pane" aria-label="Admin Panel">
      {!canAdmin && (
        <div className="callout callout--warning" role="alert" style={{ marginBottom: 'var(--space-lg)' }}>
          <strong>Admin token not set.</strong> Set <code>VITE_ADMIN_TOKEN</code> in client env to enable admin actions.
        </div>
      )}

      <section>
        <h2>Problem Management</h2>
        <div className="grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-lg)' }}>
          <div>
            <label htmlFor="pid">Problem ID</label>
            <input
              id="pid"
              className={`input ${errors.id ? 'input--error' : ''}`}
              value={problemId}
              onChange={(e) => setProblemId(e.target.value)}
              onBlur={() => problemId && loadProblemDetails(problemId)}
              placeholder="e.g., two-sum"
              aria-invalid={Boolean(errors.id)}
              aria-describedby={errors.id ? 'pid-error' : undefined}
            />
            {errors.id && (
              <div id="pid-error" className="form-error" role="alert">{errors.id}</div>
            )}
          </div>
          <div>
            <label htmlFor="plist">Existing Problems</label>
            <select
              id="plist"
              className="input"
              value={problemId}
              onChange={(e) => {
                const id = e.target.value
                setProblemId(id)
                if (id) loadProblemDetails(id)
              }}
            >
              <option value="">Select a problem…</option>
              {problems.map((p) => (
                <option key={p.id} value={p.id}>{p.id} — {p.title}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="title">Title</label>
            <input
              id="title"
              className={`input ${errors.title ? 'input--error' : ''}`}
              value={problem.title}
              onChange={(e) => setProblem({ ...problem, title: e.target.value })}
              aria-invalid={Boolean(errors.title)}
              aria-describedby={errors.title ? 'title-error' : undefined}
            />
            {errors.title && (
              <div id="title-error" className="form-error" role="alert">{errors.title}</div>
            )}
          </div>
          <div style={{ gridColumn: '1 / span 2' }}>
            <label htmlFor="statement">Statement</label>
            <textarea
              id="statement"
              className={`input ${errors.statement ? 'input--error' : ''}`}
              value={problem.statement}
              onChange={(e) => setProblem({ ...problem, statement: e.target.value })}
              rows={4}
              aria-invalid={Boolean(errors.statement)}
              aria-describedby={errors.statement ? 'statement-error' : undefined}
            />
            {errors.statement && (
              <div id="statement-error" className="form-error" role="alert">{errors.statement}</div>
            )}
          </div>
          <div>
            <label htmlFor="inputSpec">Input Spec</label>
            <input id="inputSpec" className="input" value={problem.inputSpec} onChange={(e) => setProblem({ ...problem, inputSpec: e.target.value })} />
          </div>
          <div>
            <label htmlFor="outputSpec">Output Spec</label>
            <input id="outputSpec" className="input" value={problem.outputSpec} onChange={(e) => setProblem({ ...problem, outputSpec: e.target.value })} />
          </div>
          <div style={{ gridColumn: '1 / span 2' }}>
            <label htmlFor="constraints">Constraints</label>
            <textarea id="constraints" className="input" value={problem.constraints} onChange={(e) => setProblem({ ...problem, constraints: e.target.value })} rows={2} />
          </div>
        </div>

        <div style={{ marginTop: 'var(--space-lg)', display: 'flex', gap: 'var(--space-md)' }}>
          <button className="btn" onClick={onCreate} disabled={!canAdmin || Object.keys(errors).length}>Create / Upsert</button>
          <button className="btn" onClick={onUpdate} disabled={!canAdmin || !problem.id || Object.keys(errors).length}>Update</button>
          <button className="btn btn--danger" onClick={onDelete} disabled={!canAdmin || !problemId}>Delete</button>
        </div>
      </section>

      <hr style={{ margin: 'var(--space-2xl) 0', borderColor: 'var(--color-border)' }} />

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
          <button className="btn btn--ghost" onClick={listAll} disabled={!problemId}>Refresh</button>
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
    </div>
  )
}