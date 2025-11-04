import { useEffect, useState, useCallback } from 'react'
import { listProblems, getProblem } from '../services/problemsClient'
import { createProblem, updateProblem, deleteProblem } from '../services/adminApi'
import toast from 'react-hot-toast'

export default function ProblemsPage({ problemId, setProblemId }) {
  const [problems, setProblems] = useState([])
  const [problem, setProblem] = useState({ id: '', title: '', statement: '', inputSpec: '', outputSpec: '', constraints: '' })
  const [errors, setErrors] = useState({})

  const loadProblems = useCallback(async () => {
    try {
      const data = await listProblems()
      setProblems(data)
    } catch (e) {
      console.error(e)
      toast.error('Failed to load problems')
    }
  }, [])

  useEffect(() => { loadProblems() }, [loadProblems])

  useEffect(() => {
    setProblem(p => ({ ...p, id: problemId }))
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
    } catch {
      setProblem(p => ({ ...p, id }))
    }
  }, [])

  const validate = useCallback((p) => {
    const errs = {}
    if (!p.id?.trim()) errs.id = 'Problem ID is required'
    if (!p.title?.trim()) errs.title = 'Title is required'
    if (!p.statement?.trim()) errs.statement = 'Statement is required'
    return errs
  }, [])

  useEffect(() => { setErrors(validate(problem)) }, [problem, validate])

  const onCreate = async () => {
    try {
      const errs = validate(problem)
      if (Object.keys(errs).length) { setErrors(errs); toast.error('Please fix form errors'); return }
      await createProblem(problem)
      toast.success('Problem created/updated')
      loadProblems()
    } catch (e) {
      console.error(e)
      toast.error('Failed to create problem')
    }
  }

  const onUpdate = async () => {
    try {
      const errs = validate(problem)
      if (Object.keys(errs).length) { setErrors(errs); toast.error('Please fix form errors'); return }
      await updateProblem(problem.id, problem)
      toast.success('Problem updated')
      loadProblems()
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
      loadProblems()
    } catch (e) {
      console.error(e)
      toast.error('Failed to delete problem')
    }
  }

  return (
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
        <button className="btn" onClick={onCreate} disabled={Object.keys(errors).length}>Create / Upsert</button>
        <button className="btn" onClick={onUpdate} disabled={!problem.id || Object.keys(errors).length}>Update</button>
        <button className="btn btn--danger" onClick={onDelete} disabled={!problemId}>Delete</button>
      </div>
    </section>
  )
}