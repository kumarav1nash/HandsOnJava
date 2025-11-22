import { useState, useMemo } from 'react'
import { getMcq } from './mcqData'

export default function MCQ({ mcqId, onComplete }) {
  const mcq = useMemo(() => getMcq(mcqId), [mcqId])
  const [answers, setAnswers] = useState({})
  const [checked, setChecked] = useState(false)

  if (!mcq) return null

  const toggle = (qi, optId) => {
    if (checked) return // Prevent changing answers after checking
    setAnswers(prev => ({ ...prev, [qi]: optId }))
  }
  const score = () => {
    let correct = 0
    mcq.questions.forEach((q, i) => {
      const chosen = answers[i]
      const opt = q.options.find(o => o.id === chosen)
      if (opt && opt.correct) correct++
    })
    return { correct, total: mcq.questions.length }
  }

  const onCheck = () => {
    setChecked(true)
    // if (onComplete) onComplete(score()) // Removed auto-advance
  }
  const onReset = () => { setAnswers({}); setChecked(false) }

  const { correct, total } = score()

  return (
    <section className="pane" role="region" aria-label="MCQ" style={{ padding: '2rem', maxWidth: 'var(--content-width, 800px)', margin: '0 auto' }}>
      <header className="pane__header" style={{ marginBottom: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
        <h3 className="pane__title" style={{ fontSize: '1.5rem', margin: 0 }}>{mcq.title}</h3>
        <div className="toolbar" style={{ marginLeft: 'auto' }}>
          <button className="btn btn--primary" onClick={onCheck} disabled={checked || Object.keys(answers).length < mcq.questions.length}>Check Answers</button>
          <button className="btn" onClick={onReset} style={{ marginLeft: '0.5rem' }}>Reset</button>
        </div>
      </header>

      <div className="mcq-list">
        {mcq.questions.map((q, qi) => {
          const chosen = answers[qi]
          const isCorrect = checked && q.options.find(o => o.id === chosen)?.correct

          return (
            <div key={qi} className="mcq-card" style={{
              marginBottom: '2rem',
              padding: '1.5rem',
              background: 'var(--bg-secondary)',
              borderRadius: '8px',
              border: `1px solid ${checked ? (isCorrect ? 'var(--success-color)' : 'var(--error-color)') : 'var(--border-color)'}`,
              transition: 'border-color 0.3s'
            }}>
              <h4 style={{ marginTop: 0, fontSize: '1.1rem', marginBottom: '1rem' }}>{qi + 1}. {q.prompt}</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {q.options.map(opt => {
                  const isSelected = chosen === opt.id
                  const showCorrect = checked && opt.correct
                  const showWrong = checked && isSelected && !opt.correct

                  return (
                    <label key={opt.id} style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '0.75rem',
                      borderRadius: '6px',
                      background: isSelected ? 'rgba(100, 108, 255, 0.1)' : 'transparent',
                      border: `1px solid ${isSelected ? 'var(--primary-color)' : 'var(--border-color)'}`,
                      cursor: checked ? 'default' : 'pointer'
                    }}>
                      <input
                        type="radio"
                        name={`q_${qi}`}
                        checked={isSelected}
                        onChange={() => toggle(qi, opt.id)}
                        disabled={checked}
                        style={{ marginRight: '0.75rem' }}
                      />
                      <span style={{ flex: 1 }}>{opt.text}</span>
                      {showCorrect && <span style={{ color: 'var(--success-color)', fontWeight: 'bold', marginLeft: '0.5rem' }}>✓ Correct</span>}
                      {showWrong && <span style={{ color: 'var(--error-color)', fontWeight: 'bold', marginLeft: '0.5rem' }}>✗ Your Answer</span>}
                    </label>
                  )
                })}
              </div>
              {checked && (
                <div className="muted" style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}>
                  <strong>Explanation:</strong> {q.explanation}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {checked && (
        <div className="panel__footer" style={{ marginTop: '2rem', textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
            Score: <span style={{ color: correct === total ? 'var(--success-color)' : 'var(--text-primary)' }}>{correct}/{total}</span>
          </div>
          {correct === total ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              <p style={{ color: 'var(--success-color)', margin: 0 }}>Perfect score!</p>
              {onComplete && (
                <button className="btn btn--primary btn--lg" onClick={() => onComplete(score())}>
                  Next Module →
                </button>
              )}
            </div>
          ) : (
            <p className="muted">Review the explanations and try again.</p>
          )}
        </div>
      )}
    </section>
  )
}