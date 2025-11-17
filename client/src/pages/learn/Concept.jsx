import { useMemo, useState, useCallback, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import SplitPane from '../../design-system/components/SplitPane'
import EditorPane from '../../components/EditorPane'
import OutputPane from '../../components/OutputPane'
import RunSubmitBar from '../../components/RunSubmitBar'
import { runJava } from '../../services/compilerClient'
import toast from 'react-hot-toast'
import { useI18n } from '../../i18n/useI18n.js'
import usePersistentProblemCode from '../../utils/usePersistentProblemCode'
import { findConcept } from './concepts'
import StepList from './StepList'

export default function Concept({ conceptId }) {
  const navigate = useNavigate()
  const concept = useMemo(() => findConcept(conceptId), [conceptId])

  const [code, setCode] = usePersistentProblemCode(conceptId, concept?.starterCode || '', 'learn_code')
  const [stdin, setStdin] = useState('')
  const [running, setRunning] = useState(false)
  const [stdout, setStdout] = useState('')
  const [stderr, setStderr] = useState('')
  const [meta, setMeta] = useState(null)
  const [activeStepId, setActiveStepId] = useState(concept?.steps?.[0]?.id || null)
  const [completedSteps, setCompletedSteps] = useState({})
  const editorRef = useRef(null)
  const { t } = useI18n()

  useEffect(() => {
    if (!concept) navigate('/learn')
  }, [concept, navigate])

  const activeStep = useMemo(() => (concept?.steps || []).find(s => s.id === activeStepId), [concept, activeStepId])

  useEffect(() => {
    if (activeStep && typeof activeStep.stdin === 'string') setStdin(activeStep.stdin)
  }, [activeStep])

  const onRun = useCallback(async () => {
    if (!code.trim()) return
    setRunning(true)
    setStdout('')
    setStderr('')
    setMeta(null)
    const start = Date.now()
    try {
      const res = await runJava(code, stdin)
      setStdout(res.stdout)
      setStderr(res.stderr)
      setMeta({ exitCode: res.exitCode, executionTime: res.durationMs || Date.now() - start })
    } catch (e) {
      setStderr(e?.message || 'Error')
      setMeta({ exitCode: -1, executionTime: Date.now() - start })
    } finally {
      setRunning(false)
    }
  }, [code, stdin])

  const verifyStep = useCallback(async () => {
    if (!activeStep) return
    const input = activeStep.stdin ?? ''
    const expected = (activeStep.expectedStdout ?? '').trim()
    setRunning(true)
    setStdout('')
    setStderr('')
    setMeta(null)
    const start = Date.now()
    try {
      const res = await runJava(code, input)
      const actual = (res.stdout || '').trim()
      const ok = actual === expected && res.exitCode === 0
      setStdout(res.stdout)
      setStderr(res.stderr)
      setMeta({ exitCode: res.exitCode, executionTime: res.durationMs || Date.now() - start, verified: ok })
      if (ok) {
        toast.success(t('learn.verify.success'))
        setCompletedSteps(prev => ({ ...prev, [activeStep.id]: true }))
      } else {
        toast.error(t('learn.verify.fail'))
      }
    } catch (e) {
      setStderr(e?.message || 'Error')
      setMeta({ exitCode: -1, executionTime: Date.now() - start, verified: false })
      toast.error(t('learn.verify.fail'))
    } finally {
      setRunning(false)
    }
  }, [code, activeStep])

  const resetCode = useCallback(() => {
    setCode(concept?.starterCode || '')
  }, [concept, setCode])

  const steps = concept?.steps || []

  return (
    <div className="concept" role="region" aria-label="Concept">
      <header className="catalog__header">
        <h2>{concept?.title || 'Concept'}</h2>
        <p className="muted">{concept?.summary}</p>
      </header>
      <SplitPane direction="horizontal" sizes={[42, 58]} minSize={280} gutterSize={8} ariaLabel="Learn concept layout">
        <section className="pane pane--instructions" role="region" aria-label="Instructions">
          <div className="pane__header">
            <h3 className="pane__title">{t('learn.steps.title')}</h3>
          </div>
          <StepList steps={steps} activeStepId={activeStepId} onSelectStep={setActiveStepId} completed={completedSteps} />
        </section>
        <section className="pane pane--editor" role="region" aria-label="Editor and Output">
          <div className="pane__header">
            <h3 className="pane__title">Code</h3>
            <div className="toolbar">
              <RunSubmitBar onRun={onRun} onSubmit={verifyStep} running={running} submitting={false} />
              <button className="btn btn--secondary" onClick={resetCode} title={t('learn.reset')}>{t('learn.reset')}</button>
            </div>
          </div>
          <div className="editor-container">
            <EditorPane ref={editorRef} value={code} onChange={setCode} language="java" theme="vs-dark" height="320px" />
          </div>
          <div className="controls" style={{ marginTop: '0.75rem' }}>
            <label className="label" htmlFor="stdin-input">{t('learn.input.label')}</label>
            <textarea id="stdin-input" className="input" rows={4} value={stdin} onChange={(e) => setStdin(e.target.value)} placeholder="Enter input for your program" />
          </div>
          <OutputPane stdout={stdout} stderr={stderr} metadata={meta} isRunning={running} hasOutput={Boolean(stdout?.trim()) || Boolean(stderr?.trim())} onClear={() => { setStdout(''); setStderr(''); setMeta(null) }} />
        </section>
      </SplitPane>
    </div>
  )
}