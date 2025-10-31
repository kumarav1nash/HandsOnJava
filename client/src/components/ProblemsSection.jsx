import { useEffect, useMemo, useState, useCallback } from 'react'
import { listProblems, getProblem } from '../services/problemsClient'
import { runSolution, submitSolution } from '../services/solutionsClient'
import EditorPane from './EditorPane'
import ContextMenu from '../design-system/components/ContextMenu'
import SplitPane from '../design-system/components/SplitPane'
import ProblemsHeader from './ProblemsHeader'
import ProblemTabs from './ProblemTabs'
import ResultsPanel from './ResultsPanel'
import classNames from 'classnames'
import toast from 'react-hot-toast'

const ProblemsSection = () => {
  const [problems, setProblems] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [selected, setSelected] = useState(null)
  const [codeByProblem, setCodeByProblem] = useState({})
  const [running, setRunning] = useState(false)
  const [results, setResults] = useState(null)
  const [activeTab, setActiveTab] = useState('Description')
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
      <div className="problems-layout problems-layout--single">
        <section className="problem-detail" role="region" aria-label="Problem detail and editor">
          {selected ? (
            <div className="pane pane--full">
              <ProblemsHeader 
                title={selected.title} 
                onRun={onRun} 
                onSubmit={onSubmit} 
                running={running} 
                problems={problems}
                selectedId={selectedId}
                onSelect={setSelectedId}
              />

              <ProblemTabs active={activeTab} onChange={setActiveTab} />

              {/* Outer horizontal split: left spec, right editor/results */}
              <SplitPane 
                direction="horizontal" 
                sizes={[35, 65]} 
                minSize={[280, 380]} 
                gutterSize={8} 
                ariaLabel="Resizable problem description and editor panels"
              >
                {/* Left: Problem specification */}
                <div className="pane pane--problem-spec" role="tabpanel" aria-labelledby="Description">
                  <div className="card">
                    <h4>Statement</h4>
                    <p>{selected.statement}</p>
                  </div>
                  <div className="card">
                    <h4>Input</h4>
                    <p>{selected.inputSpec}</p>
                  </div>
                  <div className="card">
                    <h4>Output</h4>
                    <p>{selected.outputSpec}</p>
                  </div>
                  <div className="card">
                    <h4>Constraints</h4>
                    <p>{selected.constraints}</p>
                  </div>
                  <div className="card">
                    <h4>Sample Test Cases</h4>
                    <ul className="samples">
                      {selected.samples.map((s, i) => (
                        <li key={i}><code>Input:</code> {s.input.replace(/\n/g, '↵ ')}; <code>Output:</code> {s.expectedOutput.replace(/\n/g, '↵ ')}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Right: nested vertical split for editor and results */}
                <div className="pane pane--editor-group">
                  <SplitPane 
                    direction="vertical" 
                    sizes={[65, 35]} 
                    minSize={[240, 200]} 
                    gutterSize={8}
                    ariaLabel="Resizable editor and test results panels"
                  >
                    {/* Editor top */}
                    <div className="editor-container">
                      <ContextMenu
                        items={[
                          { id: 'run', label: 'Run Sample Tests', shortcut: 'Cmd/Ctrl+Enter', onSelect: onRun, disabled: running },
                          { id: 'submit', label: 'Submit', onSelect: onSubmit },
                          { id: 'copy', label: 'Copy Code', shortcut: 'Cmd/Ctrl+C', onSelect: () => navigator.clipboard.writeText(code) }
                        ]}
                      >
                        <EditorPane value={code} onChange={updateCode} language="java" theme={theme} height="100%" />
                      </ContextMenu>
                    </div>
                    {/* Results bottom */}
                    <div className="results-container">
                      <ResultsPanel response={results} />
                    </div>
                  </SplitPane>
                </div>
              </SplitPane>
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