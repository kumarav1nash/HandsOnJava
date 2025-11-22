import { useMemo, useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { findCourse } from './courses'
import Concept from './Concept'
import MCQ from './MCQ.jsx'
import Practice from './Practice'
import { useI18n } from '../../i18n/useI18n.js'

export default function Course({ courseId }) {
  const course = useMemo(() => findCourse(courseId), [courseId])
  const [index, setIndex] = useState(0)
  const navigate = useNavigate()
  const { t } = useI18n()

  const modules = course?.modules || (course?.conceptIds || []).map(id => ({ type: 'concept', id }))
  const hasPrev = index > 0
  const hasNext = index + 1 < modules.length
  const module = modules[index]

  const onPrev = useCallback(() => { if (hasPrev) setIndex(i => i - 1) }, [hasPrev])
  const onNext = useCallback(() => { if (hasNext) setIndex(i => i + 1) }, [hasNext])
  const exit = useCallback(() => navigate('/learn'), [navigate])

  // Persist/restore progress per course
  useEffect(() => {
    try {
      const raw = localStorage.getItem(`course_progress_${courseId}`)
      if (raw) {
        const saved = JSON.parse(raw)
        if (typeof saved.index === 'number') setIndex(saved.index)
      }
    } catch { }
  }, [courseId])
  useEffect(() => {
    try { localStorage.setItem(`course_progress_${courseId}`, JSON.stringify({ index })) } catch { }
  }, [courseId, index])

  // Keyboard navigation: J/K for prev/next; Enter for next
  useEffect(() => {
    const handler = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
      if (e.key.toLowerCase() === 'j') { onPrev() }
      else if (e.key.toLowerCase() === 'k') { onNext() }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onPrev, onNext])

  if (!course) return null

  const progress = Math.round(((index + 1) / modules.length) * 100)

  return (
    <div className="course" role="region" aria-label="Course" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div className="course__topbar" style={{
        display: 'flex',
        alignItems: 'center',
        padding: '0.75rem 1.5rem',
        gap: '1rem',
        borderBottom: '1px solid var(--border-color, #333)',
        background: 'var(--bg-secondary, #1a1a1a)'
      }}>
        <button className="btn btn--ghost" onClick={exit} title="Exit" style={{ padding: '0.4rem 0.8rem' }}>← {t('learn.title')}</button>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.1rem' }}>{course.title}</h2>
          <div style={{ width: '200px', height: '4px', background: '#333', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{ width: `${progress}%`, height: '100%', background: 'var(--primary-color, #646cff)', transition: 'width 0.3s' }} />
          </div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
          {/* Navigation moved to footer */}
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div role="navigation" aria-label="Course modules" style={{
          display: 'flex',
          gap: '0.5rem',
          padding: '0.75rem 1.5rem',
          overflowX: 'auto',
          borderBottom: '1px solid var(--border-color, #333)',
          background: 'var(--bg-primary, #242424)'
        }}>
          {modules.map((m, i) => {
            const label = m.type === 'concept' ? 'Concept' : m.type === 'mcq' ? 'MCQ' : 'Practice'
            const active = i === index
            const completed = i < index
            return (
              <button
                key={i}
                className={`chip ${active ? 'active' : ''}`}
                style={{
                  flexShrink: 0,
                  opacity: active ? 1 : completed ? 0.8 : 0.5,
                  borderColor: active ? 'var(--primary-color, #646cff)' : 'transparent'
                }}
                aria-current={active ? 'page' : undefined}
                title={`${label} ${i + 1}`}
                onClick={() => setIndex(i)}
              >
                <span className="chip__label">{i + 1}. {label}</span>
              </button>
            )
          })}
        </div>

        <div style={{ flex: 1, position: 'relative' }}>
          {module?.type === 'concept' && <Concept conceptId={module.id} hideNav={true} />}
          {module?.type === 'mcq' && <MCQ mcqId={module.id} onComplete={() => onNext()} />}
          {module?.type === 'practice' && <Practice exerciseId={module.id} onComplete={() => onNext()} />}
        </div>
      </div>

      <div className="course__footer" style={{
        padding: '1rem 1.5rem',
        borderTop: '1px solid var(--border-color)',
        background: 'var(--bg-secondary)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        bottom: 0,
        zIndex: 10
      }}>
        <button className="btn" onClick={onPrev} disabled={!hasPrev} title={t('learn.nav.prev')}>← {t('learn.nav.prev')}</button>
        <div className="muted" style={{ fontSize: '0.9rem' }}>
          {index + 1} / {modules.length}
        </div>
        <button className="btn btn--primary" onClick={onNext} disabled={!hasNext} title={t('learn.nav.next')}>{t('learn.nav.next')} →</button>
      </div>
    </div>
  )
}

function QnA({ courseId }) {
  const [items, setItems] = useState(() => {
    try {
      const raw = localStorage.getItem(`qna_${courseId}`)
      return raw ? JSON.parse(raw) : []
    } catch { return [] }
  })
  const [text, setText] = useState('')

  const add = () => {
    const next = [...items, { id: Date.now(), text }]
    setItems(next)
    setText('')
    try { localStorage.setItem(`qna_${courseId}`, JSON.stringify(next)) } catch { }
  }
  const remove = (id) => {
    const next = items.filter(i => i.id !== id)
    setItems(next)
    try { localStorage.setItem(`qna_${courseId}`, JSON.stringify(next)) } catch { }
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
        <input className="input" type="text" value={text} onChange={(e) => setText(e.target.value)} placeholder="Type a question" id="qna-input" name="question" />
        <button className="btn btn--primary" onClick={add} disabled={!text.trim()}>Ask</button>
      </div>
      {items.length === 0 ? (
        <div className="empty-state">No questions yet</div>
      ) : (
        <ul className="problem-list" role="list">
          {items.map(i => (
            <li key={i.id} className="problem-item">
              <div className="problem-link" style={{ justifyContent: 'space-between' }}>
                <span>{i.text}</span>
                <button className="btn btn--ghost" onClick={() => remove(i.id)} title="Remove">✕</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}