import { useCallback, useMemo, useRef, useState } from 'react'
import EditorPane from '../../components/EditorPane'
import OutputPane from '../../components/OutputPane'
import RunSubmitBar from '../../components/RunSubmitBar'
import { runJava } from '../../services/compilerClient'
import usePersistentProblemCode from '../../utils/usePersistentProblemCode'
import { getPractice } from './practices'
import SplitPane from '../../design-system/components/SplitPane'

export default function Practice({ exerciseId, onComplete }) {
  const exercise = useMemo(() => getPractice(exerciseId), [exerciseId])
  const [code, setCode] = usePersistentProblemCode(exerciseId, exercise?.starterCode || '', 'learn_exercise')
  const [stdin, setStdin] = useState(exercise?.stdin || '')
  const [running, setRunning] = useState(false)
  const [stdout, setStdout] = useState('')
  const [stderr, setStderr] = useState('')
  const [meta, setMeta] = useState(null)
  const editorRef = useRef(null)

  const onRun = useCallback(async () => {
    if (!code.trim()) return
    setRunning(true); setStdout(''); setStderr(''); setMeta(null)
    const start = Date.now()
    try {
      const res = await runJava(code, stdin)
      setStdout(res.stdout); setStderr(res.stderr)
      setMeta({ exitCode: res.exitCode, executionTime: res.durationMs || Date.now() - start })
    } catch (e) {
      setStderr(e?.message || 'Error'); setMeta({ exitCode: -1, executionTime: Date.now() - start })
    } finally { setRunning(false) }
  }, [code, stdin])

  const onVerify = useCallback(async () => {
    if (!exercise) return
    setRunning(true); setStdout(''); setStderr(''); setMeta(null)
    const start = Date.now()
    try {
      const res = await runJava(code, exercise.stdin || '')
      const ok = (res.stdout || '').trim() === (exercise.expectedStdout || '').trim() && res.exitCode === 0
      setStdout(res.stdout); setStderr(res.stderr)
      setMeta({ exitCode: res.exitCode, executionTime: res.durationMs || Date.now() - start, verified: ok })
      if (ok && typeof onComplete === 'function') onComplete({ verified: true })
    } catch (e) {
      setStderr(e?.message || 'Error'); setMeta({ exitCode: -1, executionTime: Date.now() - start, verified: false })
    } finally { setRunning(false) }
  }, [code, exercise])

  const reset = useCallback(() => setCode(exercise?.starterCode || ''), [exercise, setCode])

  if (!exercise) return null

  return (
    <div className="practice" role="region" aria-label="Practice" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <SplitPane direction="horizontal" sizes={[40, 60]} minSize={300} gutterSize={8} ariaLabel="Practice layout">
        <section className="pane" style={{ padding: '1.5rem', overflowY: 'auto' }}>
          <h3 style={{ marginTop: 0, fontSize: '1.5rem', marginBottom: '1rem' }}>{exercise.title}</h3>
          <div className="card" style={{
            background: 'var(--bg-secondary, #1e1e1e)',
            padding: '1.5rem',
            borderRadius: '8px',
            border: '1px solid var(--border-color, #333)',
            marginBottom: '1.5rem'
          }}>
            <h4 style={{ marginTop: 0, marginBottom: '0.5rem', color: 'var(--text-muted, #999)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Goal</h4>
            <p style={{ margin: 0, lineHeight: '1.6' }}>{exercise.goal}</p>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ marginBottom: '0.5rem' }}>Instructions</h4>
            <ul style={{ paddingLeft: '1.2rem', lineHeight: '1.6' }}>
              <li>Read the goal carefully.</li>
              <li>Write your code in the editor on the right.</li>
              <li>Use the "Run" button to test your code.</li>
              <li>Click "Submit" when you are ready to verify your solution.</li>
            </ul>
          </div>

          {exercise.hint && (
            <div style={{
              background: 'rgba(100, 108, 255, 0.1)',
              borderLeft: '4px solid var(--primary-color, #646cff)',
              padding: '1rem',
              borderRadius: '0 4px 4px 0'
            }}>
              <strong>Hint:</strong> {exercise.hint}
            </div>
          )}
        </section>

        <section className="pane" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="pane__header" style={{ padding: '0.75rem', background: 'var(--bg-primary, #242424)', borderBottom: '1px solid var(--border-color, #333)' }}>
            <div className="toolbar" style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 500 }}>Code Editor</span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <RunSubmitBar onRun={onRun} onSubmit={onVerify} running={running} submitting={false} />
                <button className="btn btn--secondary" onClick={reset} title="Reset Code">Reset</button>
              </div>
            </div>
          </div>

          <div style={{ flex: 1, position: 'relative' }}>
            <EditorPane ref={editorRef} value={code} onChange={setCode} language="java" theme="vs-dark" height="100%" />
          </div>

          <div className="controls" style={{ padding: '0.75rem', borderTop: '1px solid var(--border-color, #333)', background: 'var(--bg-primary, #242424)' }}>
            <label className="label" htmlFor="stdin-input" style={{ marginBottom: '0.5rem', display: 'block', fontSize: '0.85rem' }}>Program Input (stdin)</label>
            <textarea
              id="stdin-input"
              className="input"
              rows={3}
              value={stdin}
              onChange={(e) => setStdin(e.target.value)}
              placeholder="Enter input for your program"
              style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}
            />
          </div>

          <div style={{ height: '30%', minHeight: '150px', borderTop: '1px solid var(--border-color, #333)' }}>
            <OutputPane stdout={stdout} stderr={stderr} metadata={meta} isRunning={running} hasOutput={Boolean(stdout?.trim()) || Boolean(stderr?.trim())} onClear={() => { setStdout(''); setStderr(''); setMeta(null) }} />
          </div>
        </section>
      </SplitPane>
    </div>
  )
}