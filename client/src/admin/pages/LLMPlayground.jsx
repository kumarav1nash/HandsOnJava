import React, { useEffect, useState, useCallback } from 'react'
import EditorPane from '../../components/EditorPane'
import ResultsPanel from '../../components/ResultsPanel'
import { listProblems } from '../../services/problemsClient'
import { generateCandidate, executeCandidate } from '../../services/adminPlayground'
import toast from 'react-hot-toast'

export default function LLMPlayground() {
  const [problems, setProblems] = useState([])
  const [problemId, setProblemId] = useState('')
  const [prompt, setPrompt] = useState('Given the problem, generate a correct, efficient Java solution.')
  const [code, setCode] = useState('// Click Generate to draft a solution for the selected problem')
  const [running, setRunning] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [results, setResults] = useState(null)

  useEffect(() => {
    let alive = true
    async function loadProblems() {
      try {
        const data = await listProblems()
        if (!alive) return
        setProblems(Array.isArray(data) ? data : [])
        if (Array.isArray(data) && data.length > 0 && !problemId) {
          setProblemId(data[0].id)
        }
      } catch (e) {
        toast.error('Failed to load problems')
      }
    }
    loadProblems()
    return () => { alive = false }
  }, [])

  const onGenerate = useCallback(async () => {
    if (!problemId) {
      toast.error('Select a problem first')
      return
    }
    setGenerating(true)
    try {
      const { code: generated, notes } = await generateCandidate({ problemId, prompt })
      setCode(generated || '')
      if (notes) toast.success('Generated candidate')
    } catch (e) {
      toast.error('Generation failed')
    } finally {
      setGenerating(false)
    }
  }, [problemId, prompt])

  const onRun = useCallback(async () => {
    if (!problemId) { toast.error('Select a problem first'); return }
    if (!code || !code.trim()) { toast.error('No code to run'); return }
    setRunning(true)
    try {
      const data = await executeCandidate({ problemId, code })
      setResults(data)
      toast.success(data?.allPassed ? 'All tests passed' : 'Executed against tests')
    } catch (e) {
      toast.error('Execution failed')
    } finally {
      setRunning(false)
    }
  }, [problemId, code])

  return (
    <div className="admin-llm-playground">
      <header className="admin-section-header">
        <h3>LLM Playground</h3>
        <p className="muted">Generate solutions and validate against test cases</p>
      </header>

      <div className="panel-grid">
        <section className="panel" aria-label="Problem & Prompt">
          <div className="panel__header"><h4>Problem & Prompt</h4></div>
          <div className="panel__content grid-two">
            <div>
              <label className="label">Problem
                <select className="input" value={problemId} onChange={(e) => setProblemId(e.target.value)}>
                  {problems.map(p => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
              </label>
              <label className="label">Prompt
                <textarea className="input" rows={6} value={prompt} onChange={(e) => setPrompt(e.target.value)} />
              </label>
              <div className="actions">
                <button className="btn" onClick={onGenerate} disabled={generating || !problemId}>Generate</button>
                <button className="btn btn--secondary" onClick={onRun} disabled={running || !problemId}>Run Tests</button>
              </div>
            </div>
            <div>
              <label className="label">Candidate Code</label>
              <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
                <EditorPane 
                  value={code}
                  onChange={setCode}
                  language="java"
                  height="420px"
                  onRun={onRun}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="panel" aria-label="Results">
          <div className="panel__header"><h4>Results</h4></div>
          <div className="panel__content">
            {!results ? (
              <p className="muted">Run to see test case results.</p>
            ) : (
              <ResultsPanel response={results} />
            )}
          </div>
        </section>
      </div>
    </div>
  )
}