import React, { useEffect, useState, useCallback, useRef } from 'react'
import EditorPane from '../../components/EditorPane'
import ResultsPanel from '../../components/ResultsPanel'
import { listProblems, getProblem } from '../../services/problemsClient'
import { generateCandidate, executeCandidate } from '../../services/adminPlayground'
import { generateTestCases, saveTestCases } from '../../services/adminPlayground'
import { updateProblem } from '../../services/adminApi'
import toast from 'react-hot-toast'
import usePersistentProblemCode from '../../utils/usePersistentProblemCode'

export default function LLMPlayground() {
  const [problems, setProblems] = useState([])
  const [problemId, setProblemId] = useState('')
  const [prompt, setPrompt] = useState('Given the problem, generate a correct, efficient Java solution.')
  const [code, setCode] = usePersistentProblemCode(problemId, '// Click Generate to draft a solution for the selected problem', 'playground_code')
  const [running, setRunning] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [results, setResults] = useState(null)
  // Removed prompt collapse; keep prompt visible and compact
  const [generatedCases, setGeneratedCases] = useState([])
  const [selectedCaseIdx, setSelectedCaseIdx] = useState(new Set())
  const [savingHidden, setSavingHidden] = useState(true)
  const [generatingCases, setGeneratingCases] = useState(false)
  const editorContainerRef = useRef(null)

  // Right panel: problem description editing state
  const [selectedProblem, setSelectedProblem] = useState(null)
  const [desc, setDesc] = useState('')
  const [descDirty, setDescDirty] = useState(false)
  const [descSaving, setDescSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState(null)

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

  // Load selected problem detail when problemId changes
  useEffect(() => {
    let alive = true
    async function loadDetail() {
      if (!problemId) { setSelectedProblem(null); setDesc(''); setDescDirty(false); return }
      try {
        const p = await getProblem(problemId)
        if (!alive) return
        setSelectedProblem(p)
        const statement = String(p?.statement || '')
        setDesc(statement)
        setDescDirty(false)
      } catch (e) {
        toast.error('Failed to load problem details')
      }
    }
    loadDetail()
    return () => { alive = false }
  }, [problemId])

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
      // toast.success(data?.allPassed ? 'All tests passed' : 'Executed against tests')
    } catch (e) {
      toast.error('Execution failed')
    } finally {
      setRunning(false)
    }
  }, [problemId, code])

  const onGenerateCases = useCallback(async () => {
    if (!problemId) { toast.error('Select a problem first'); return }
    if (!code || !code.trim()) { toast.error('Generate or paste code first'); return }
    setGeneratingCases(true)
    try {
      const data = await generateTestCases({ problemId, code, count: 5 })
      setGeneratedCases(Array.isArray(data?.cases) ? data.cases : [])
      toast.success('Generated test cases')
    } catch (e) {
      toast.error('Failed to generate test cases')
    } finally {
      setGeneratingCases(false)
    }
  }, [problemId, code])

  const onSaveSelectedCases = useCallback(async () => {
    if (!problemId) { toast.error('Select a problem first'); return }
    const casesToSave = generatedCases
      .map((c, idx) => ({ c, idx }))
      .filter(({ idx }) => selectedCaseIdx.has(idx))
      .map(({ c }) => ({ input: c.input, expectedOutput: c.expectedOutput, sample: !savingHidden }))
    if (casesToSave.length === 0) { toast.error('Select cases to save'); return }
    try {
      const resp = await saveTestCases({ problemId, cases: casesToSave, hidden: savingHidden })
      toast.success(`Saved ${resp?.saved || casesToSave.length} test case(s)${savingHidden ? ' as hidden' : ''}`)
      setSelectedCaseIdx(new Set())
    } catch (e) {
      toast.error('Failed to save test cases')
    }
  }, [problemId, generatedCases, selectedCaseIdx, savingHidden])

  // Keyboard shortcuts removed per admin request

  return (
    <div className="admin-llm-playground">
      <header className="admin-section-header">
        <p className="muted">Generate solutions and validate against test cases</p>
      </header>

      <div className="panel-grid">
        <section className="panel" aria-label="Problem & Prompt">
          
          {/* Left card redesigned: top 80% code, bottom 20% controls */}
          <div className="panel__content llm-left-grid">
            {/* Top: Candidate Code fills available space */}
            <div className="llm-code-area">
              <label className="label">Code Editor</label>
              <div ref={editorContainerRef} style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', position: 'relative', minHeight: 0, height: '100%' }}>
                <EditorPane 
                  value={code}
                  onChange={setCode}
                  language="java"
                  height={'100%'}
                  onRun={onRun}
                />
                {(running || generating) && (
                  <div 
                    className="editor-overlay"
                    role="progressbar"
                    aria-label={running ? 'Running tests' : 'Generating candidate'}
                    style={{ position: 'absolute', inset: 0, background: 'rgba(17,24,39,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 5 }}
                  >
                    <div className="output-pane__loading" style={{ background: 'transparent', boxShadow: 'none' }}>
                      <div className="loading-spinner" aria-hidden="true">
                        <div className="loading-spinner__dot"></div>
                        <div className="loading-spinner__dot"></div>
                        <div className="loading-spinner__dot"></div>
                      </div>
                      <span className="output-pane__loading-text">
                        {running ? 'Running tests...' : 'Generating candidate...'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom: controls split - left selector, right prompt + actions */}
            <div className="llm-bottom-controls-grid">
              <div>
                <label className="label">Prompt
                  <textarea className="input" rows={4} value={prompt} onChange={(e) => setPrompt(e.target.value)} />
                </label>
                <div className="llm-actions-row">
                  <button 
                    className="btn btn--primary" 
                    onClick={onGenerate} 
                    disabled={generating || !problemId}
                    aria-label={generating ? 'Generating candidate' : 'Generate candidate'}
                    title="Generate"
                  >
                    {generating ? (<><span className="btn__spinner" aria-hidden="true">⟳</span> Generating...</>) : (<><span aria-hidden="true">✨</span> Generate</>)}
                  </button>
                  <button 
                    className="btn btn--secondary" 
                    onClick={onRun} 
                    disabled={running || !problemId}
                    aria-label={running ? 'Running tests' : 'Run tests'}
                    title="Run Tests"
                  >
                    {running ? (<><span className="btn__spinner" aria-hidden="true">⟳</span> Running...</>) : (<><span aria-hidden="true">▶</span> Run Tests</>)}
                  </button>
                  <button 
                    className="btn btn--accent" 
                    onClick={onGenerateCases} 
                    disabled={generatingCases || !problemId || !code}
                    aria-label={generatingCases ? 'Generating test cases' : 'Generate more test cases'}
                    title="Generate More Test Cases"
                  >
                    {generatingCases ? (<><span className="btn__spinner" aria-hidden="true">⟳</span> Generating...</>) : (<><span aria-hidden="true">🧪</span> Generate More Test Cases</>)}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="panel" aria-label="Results">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {generatedCases?.length > 0 && (
              <div className="subtabs" style={{ alignItems: 'center', gap: '0.5rem' }}>
                <label className="label" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                  Hidden on save
                  <input type="checkbox" checked={savingHidden} onChange={(e) => setSavingHidden(e.target.checked)} />
                </label>
                <button 
                  className="btn btn--primary" 
                  onClick={onSaveSelectedCases}
                  aria-label="Save selected test cases"
                  title="Save Selected"
                >
                  <span aria-hidden="true">💾</span> Save Selected
                </button>
              </div>
            )}
          </div>
          <div className="panel__content llm-right-scroll" role="region" aria-label="Problem description and results">
            {/* Full-width Problem selector at top */}
            <div className="llm-right-selector">
              <label className="label" style={{ display: 'block' }}>Problem
                <select className="input" style={{ width: '100%' }} value={problemId} onChange={(e) => setProblemId(e.target.value)}>
                  {problems.map(p => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
              </label>
            </div>
            {/* Problem Description (editable) */}
            <div className="card llm-desc-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem' }}>
                <h5 style={{ margin: 0 }}>Problem Description</h5>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button 
                    className="btn btn--primary"
                    onClick={async () => {
                      if (!problemId) { toast.error('Select a problem first'); return }
                      setDescSaving(true)
                      try {
                        const base = selectedProblem || {}
                        const updated = {
                          id: problemId,
                          title: base.title || '',
                          statement: desc || '',
                          inputSpec: base.inputSpec || '',
                          outputSpec: base.outputSpec || '',
                          constraints: base.constraints ?? '',
                          tags: Array.isArray(base.tags) ? base.tags : []
                        }
                        await updateProblem(problemId, updated)
                        setDescDirty(false)
                        setLastSaved(new Date())
                        toast.success('Description saved')
                      } catch (e) {
                        toast.error('Failed to save description')
                      } finally {
                        setDescSaving(false)
                      }
                    }}
                    disabled={!descDirty || descSaving || !problemId}
                    aria-label={descSaving ? 'Saving description' : 'Save problem description'}
                    title="Save Description"
                  >
                    {descSaving ? (<><span className="btn__spinner" aria-hidden="true">⟳</span> Saving...</>) : (<><span aria-hidden="true">💾</span> Save</>)}
                  </button>
                  {lastSaved && (
                    <span className="muted" title={`Last saved ${lastSaved.toLocaleString()}`}>
                      Saved {lastSaved.toLocaleTimeString()}
                    </span>
                  )}
                </div>
              </div>
              <label className="label" style={{ display: 'block', marginTop: 'var(--space-sm)' }}>
                Description
                <textarea 
                  className="input llm-desc-editor"
                  rows={8}
                  value={desc}
                  onChange={(e) => { setDesc(e.target.value); setDescDirty(true) }}
                  placeholder="Enter the problem statement with formatting"
                />
              </label>
            </div>

            {/* Results section */}
            <div className="card llm-results-card" style={{ marginTop: 'var(--space-lg)' }}>
              <h5 style={{ marginTop: 0, marginBottom: 'var(--space-sm)' }}>Results</h5>
              {!results ? (
                <p className="muted">Run to see test case results.</p>
              ) : (
                <ResultsPanel response={results} />
              )}
            </div>

            <div style={{ marginTop: 'var(--space-lg)' }}>
              {generatedCases && generatedCases.length > 0 ? (
                <div>
                  <h5 style={{ marginTop: 0 }}>Generated Test Cases</h5>
                  <ul className="problem-list">
                    {generatedCases.map((c, idx) => (
                      <li key={idx} className="problem-item" style={{ padding: '0.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ color: 'var(--color-text-secondary)' }}>Input</div>
                            <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{c.input}</pre>
                            <div style={{ color: 'var(--color-text-secondary)', marginTop: '0.5rem' }}>Expected Output</div>
                            <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{c.expectedOutput}</pre>
                            <div style={{ color: c.passed ? 'var(--color-success)' : 'var(--color-error)', marginTop: '0.5rem' }}>
                              {c.passed ? 'Passed' : `Failed (exit ${c.exitCode})`}
                            </div>
                            {!c.passed && c.actualOutput && (
                              <div style={{ marginTop: '0.25rem' }}>
                                <div style={{ color: 'var(--color-text-secondary)' }}>Actual Output</div>
                                <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{c.actualOutput}</pre>
                              </div>
                            )}
                          </div>
                          <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                            <input
                              type="checkbox"
                              checked={selectedCaseIdx.has(idx)}
                              onChange={(e) => {
                                const next = new Set(selectedCaseIdx)
                                if (e.target.checked) next.add(idx); else next.delete(idx)
                                setSelectedCaseIdx(next)
                              }}
                            />
                            Select
                          </label>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="muted">No generated test cases yet.</p>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}