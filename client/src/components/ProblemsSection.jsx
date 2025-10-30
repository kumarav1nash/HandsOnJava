import { useEffect, useMemo, useState, useCallback } from 'react'
import { listProblems, getProblem } from '../services/problemsClient'
import { runSolution, submitSolution } from '../services/solutionsClient'
import EditorPane from './EditorPane'
import classNames from 'classnames'
import toast from 'react-hot-toast'

const ProblemsSection = () => {
  const [problems, setProblems] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [selected, setSelected] = useState(null)
  const [codeByProblem, setCodeByProblem] = useState({})
  const [running, setRunning] = useState(false)
  const [results, setResults] = useState(null)
  const [theme, setTheme] = useState(localStorage.getItem('editor_theme') || 'vs-dark')

  useEffect(() => {
    async function load() {
      try {
        const list = await listProblems()
        setProblems(list)
        const first = list?.[0]?.id || null
        if (first) setSelectedId(first)
      } catch (e) {
        toast.error('Failed to load problems')
      }
    }
    load()
  }, [])

  useEffect(() => {
    async function loadDetail() {
      if (!selectedId) return
      try {
        const p = await getProblem(selectedId)
        setSelected(p)
        const saved = localStorage.getItem(`problem_code_${selectedId}`)
        setCodeByProblem((prev) => ({ ...prev, [selectedId]: saved || defaultStarter() }))
      } catch (e) {
        toast.error('Failed to load problem detail')
      }
    }
    loadDetail()
  }, [selectedId])

  const defaultStarter = useCallback(() => (
    'import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // TODO: implement solution\n    }\n}'
  ), [])

  const code = codeByProblem[selectedId] || ''

  const updateCode = (val) => {
    setCodeByProblem((prev) => ({ ...prev, [selectedId]: val }))
    if (selectedId) localStorage.setItem(`problem_code_${selectedId}`, val)
  }

  const onRun = async () => {
    if (!selectedId) return
    setRunning(true)
    setResults(null)
    const loadingToast = toast.loading('Running sample tests...')
    try {
      const res = await runSolution({ problemId: selectedId, code })
      setResults(res)
      toast.dismiss(loadingToast)
      toast[res.allPassed ? 'success' : 'error'](res.allPassed ? 'All tests passed' : 'Some tests failed')
    } catch (e) {
      toast.dismiss(loadingToast)
      toast.error('Run failed')
    } finally {
      setRunning(false)
    }
  }

  const onSubmit = async () => {
    if (!selectedId) return
    const loadingToast = toast.loading('Submitting solution...')
    try {
      const res = await submitSolution({ problemId: selectedId, code })
      setResults(res)
      toast.dismiss(loadingToast)
      toast[res.accepted ? 'success' : 'error'](res.message)
    } catch (e) {
      toast.dismiss(loadingToast)
      toast.error('Submission failed')
    }
  }

  return (
    <div className="problems-section" role="region" aria-label="Problems">
      <div className="problems-layout">
        <aside className="problems-list" aria-label="Problem list">
          <h3 className="pane__title">Problems</h3>
          <ul className="list">
            {Array.isArray(problems) && problems.map((p) => (
              <li key={p.id}>
                <button
                  className={classNames('btn btn--ghost', { active: selectedId === p.id })}
                  onClick={() => setSelectedId(p.id)}
                  aria-pressed={selectedId === p.id}
                >
                  {p.title}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <section className="problem-detail" role="region" aria-label="Problem detail and editor">
          {selected ? (
            <div className="pane">
              <div className="pane__header">
                <h2 className="pane__title">{selected.title}</h2>
                <div className="toolbar">
                  <button className={classNames('btn', 'btn--primary', { loading: running })} onClick={onRun} disabled={running}>
                    {running ? 'Running…' : 'Run'}
                  </button>
                  <button className="btn btn--success" onClick={onSubmit}>Submit</button>
                </div>
              </div>

              <div className="problem-content">
                <div className="problem-spec">
                  <h4>Statement</h4>
                  <p>{selected.statement}</p>
                  <h4>Input</h4>
                  <p>{selected.inputSpec}</p>
                  <h4>Output</h4>
                  <p>{selected.outputSpec}</p>
                  <h4>Constraints</h4>
                  <p>{selected.constraints}</p>
                  <h4>Sample Test Cases</h4>
                  <ul>
                    {selected.samples.map((s, i) => (
                      <li key={i}><code>Input:</code> {s.input.replace(/\n/g, '↵ ')}; <code>Output:</code> {s.expectedOutput.replace(/\n/g, '↵ ')}</li>
                    ))}
                  </ul>
                </div>

                <div className="editor-container" style={{ minHeight: 300 }}>
                  <EditorPane value={code} onChange={updateCode} language="java" theme={theme} height="300px" />
                </div>
              </div>

              {results && (
                <div className="test-results">
                  <h4>Results</h4>
                  <div className="outputs">
                    {results.results.map((r, i) => (
                      <div key={i} className="output">
                        <div className="output__title">Test #{i + 1} — {r.passed ? 'Pass' : 'Fail'}</div>
                        <pre className={classNames('output__content', { success: r.passed, error: !r.passed })}>
{`Input:\n${r.input}\nExpected:\n${r.expectedOutput}\nActual:\n${r.actualOutput}\nExit: ${r.exitCode} • ${r.durationMs} ms`}
                        </pre>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="pane"><p>Select a problem to view details.</p></div>
          )}
        </section>
      </div>
    </div>
  )
}

export default ProblemsSection