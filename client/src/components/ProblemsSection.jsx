import { useEffect, useMemo, useState, useCallback, useRef } from 'react'
import { listProblems, getProblem } from '../services/problemsClient'
import { runSolution, submitSolution } from '../services/solutionsClient'
import EditorPane from './EditorPane'
import ContextMenu from '../design-system/components/ContextMenu'
import SplitPane from '../design-system/components/SplitPane'
import ProblemTabs from './ProblemTabs'
import ResultsPanel from './ResultsPanel'
import RunSubmitBar from './RunSubmitBar'
import classNames from 'classnames'
import toast from 'react-hot-toast'
import ProblemSpec from './ProblemSpec'

const ProblemsSection = ({ onProblemNavChange }) => {
  const [problems, setProblems] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [selected, setSelected] = useState(null)
  const [codeByProblem, setCodeByProblem] = useState({})
  const [running, setRunning] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [results, setResults] = useState(null)
  const resultsRef = useRef(null)
  const [autoScrollResults, setAutoScrollResults] = useState(false)
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
      // Clear any previous problem's transient state when switching problems
      setResults(null)
      setAutoScrollResults(false)
      setRunning(false)
      setSubmitting(false)
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
    setAutoScrollResults(true)
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
    setSubmitting(true)
    setAutoScrollResults(true)
    const loadingToast = toast.loading('Submitting solution...')
    try {
      const res = await submitSolution({ problemId: selectedId, code })
      setResults(res)
      toast.dismiss(loadingToast)
      toast[res.accepted ? 'success' : 'error'](res.message)
    } catch (e) {
      toast.dismiss(loadingToast)
      toast.error('Submission failed')
    } finally {
      setSubmitting(false)
    }
  }

  // When results are ready and autoScrollResults is set, bring results into view
  useEffect(() => {
    if (results && autoScrollResults && resultsRef.current) {
      try {
        resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      } catch (_) {}
      setAutoScrollResults(false)
    }
  }, [results, autoScrollResults])

  // Compute and expose header-level problem navigation whenever list/selection changes
  useEffect(() => {
    if (!Array.isArray(problems) || problems.length === 0 || !selectedId) {
      onProblemNavChange?.(null)
      return
    }
    const idx = problems.findIndex((p) => p.id === selectedId)
    const hasPrev = idx > 0
    const hasNext = idx >= 0 && idx < problems.length - 1
    const onPrev = () => { if (hasPrev) setSelectedId(problems[idx - 1].id) }
    const onNext = () => { if (hasNext) setSelectedId(problems[idx + 1].id) }
    onProblemNavChange?.({ hasPrev, hasNext, onPrev, onNext })
  }, [problems, selectedId, onProblemNavChange])

  return (
    <div className="problems-section" role="region" aria-label="Problems">
      <div className="problems-layout problems-layout--single">
        <section className="problem-detail" role="region" aria-label="Problem detail and editor">
          {selected ? (
            <div className="pane pane--full">
              {/* Outer horizontal split: left spec, right editor/results */}
              <SplitPane 
                direction="horizontal" 
                sizes={[35, 65]} 
                minSize={[280, 380]} 
                gutterSize={8} 
                ariaLabel="Resizable problem description and editor panels"
              >
                {/* Left: Problem specification */}
                <div className="pane pane--problem-spec" role="region" aria-label="Problem content">
                  <ProblemTabs active={activeTab} onChange={setActiveTab} />
                  {activeTab === 'Description' && (
                    <ProblemSpec problem={selected} />
                  )}
                  {activeTab === 'Editorial' && (
                    <div className="problem-editorial">
                      {selected?.editorial ? (
                        <div dangerouslySetInnerHTML={{ __html: selected.editorial }} />
                      ) : (
                        <p>Editorial coming soon.</p>
                      )}
                    </div>
                  )}
                  {activeTab === 'Submissions' && (
                    <div className="problem-submissions">
                      <p>Your recent submissions will appear here.</p>
                    </div>
                  )}
                </div>

                {/* Right: nested vertical split for editor and results */}
                <div className="pane pane--editor-group">
                  {/** Determine if results area should be opened (bottom-up) */}
                  {(() => { /* noop self-invoking for scoping */ return null })()}
                  <SplitPane 
                    direction="vertical" 
                    /* If results/running/submitting, expand bottom pane upward */
                    key={`vr-${results || running || submitting ? 'open' : 'closed'}`}
                    sizes={results || running || submitting ? [60, 40] : [92, 8]} 
                    minSize={[240, 120]} 
                    gutterSize={8}
                    ariaLabel="Resizable editor and test results panels"
                  >
                    {/* Editor top */}
                    <div className="editor-container">
                      <ContextMenu
                        items={[
                          { id: 'run', label: 'Run Sample Tests', shortcut: 'Cmd/Ctrl+Enter', onSelect: onRun, disabled: running || submitting },
                          { id: 'submit', label: 'Submit', shortcut: 'Cmd/Ctrl+Shift+Enter', onSelect: onSubmit, disabled: running || submitting },
                          { id: 'copy', label: 'Copy Code', shortcut: 'Cmd/Ctrl+C', onSelect: () => navigator.clipboard.writeText(code) }
                        ]}
                      >
                        <EditorPane 
                          value={code} 
                          onChange={updateCode} 
                          language="java" 
                          theme={theme} 
                          height="100%" 
                          onRun={onRun}
                          onSubmit={onSubmit}
                        />
                      </ContextMenu>
                    </div>
                    {/* Results bottom */}
                    <div className="results-container" ref={resultsRef}>
                      <ResultsPanel response={results} />
                    </div>
                  </SplitPane>
                  {/* Overlayed bottom-right run/submit */}
                  <RunSubmitBar 
                    onRun={onRun}
                    onSubmit={onSubmit}
                    running={running}
                    submitting={submitting}
                  />
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