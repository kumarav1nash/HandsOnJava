import { useMemo, useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { findCourse } from './courses'
import { getCourse } from '../../services/learnApi'
import Concept from './Concept'
import MCQ from './MCQ.jsx'
import Practice from './Practice'
import { useI18n } from '../../i18n/useI18n.js'
import styles from './Course.module.css'

export default function Course({ courseId }) {
  const useApi = import.meta.env.VITE_LEARN_USE_API === 'true'
  const [apiCourse, setApiCourse] = useState(null)
  useEffect(() => {
    if (!useApi) return
    getCourse(courseId)
      .then(json => setApiCourse(json?.data || null))
      .catch(() => setApiCourse(null))
  }, [useApi, courseId])
  const course = useMemo(() => useApi ? apiCourse : findCourse(courseId), [useApi, apiCourse, courseId])
  const [index, setIndex] = useState(0)
  const navigate = useNavigate()
  const { t } = useI18n()

  const modules = course?.modules
    ? course.modules.map(m => ({ type: m.type, id: m.refId || m.id }))
    : (course?.conceptIds || []).map(id => ({ type: 'concept', id }))
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
    <div className={`${styles.course} ds-animate-fade-in`} role="region" aria-label="Course">
      <div className={styles.course__topbar}>
        <button 
          className="ds-btn ds-btn--ghost ds-btn--sm ds-hover-lift" 
          onClick={exit} 
          title="Exit"
        >
          ← {t('learn.title')}
        </button>
        
        <div className={styles.course__progress}>
          <h2 className={styles.course__title}>{course.title}</h2>
          <div className={styles['course__progress-bar']}>
            <div 
              className={styles['course__progress-fill']}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className={styles.course__content}>
        <nav className={`${styles.course__navigation} ds-animate-slide-in-right`} role="navigation" aria-label="Course modules">
          {modules.map((m, i) => {
            const label = m.type === 'concept' ? 'Concept' : m.type === 'mcq' ? 'MCQ' : 'Practice'
            const active = i === index
            const completed = i < index
            return (
              <div key={i} className={styles['course__nav-item']}>
                <button
                  className={`${styles['course__nav-chip']} ${active ? 'is-active' : ''} ${completed ? 'is-completed' : ''}`}
                  aria-current={active ? 'page' : undefined}
                  title={`${label} ${i + 1}`}
                  onClick={() => setIndex(i)}
                >
                  <span className={styles['course__nav-label']}>
                    {i + 1}. {label}
                  </span>
                </button>
              </div>
            )
          })}
        </nav>

        <div className="ds-flex-1">
          {module?.type === 'concept' && <Concept conceptId={module.id} hideNav={true} />}
          {module?.type === 'mcq' && <MCQ mcqId={module.id} onComplete={() => onNext()} />}
          {module?.type === 'practice' && <Practice exerciseId={module.id} onComplete={() => onNext()} />}
        </div>
      </div>

      <div className={styles.course__footer}>
        <button 
          className="ds-btn ds-btn--secondary ds-hover-lift" 
          onClick={onPrev} 
          disabled={!hasPrev} 
          title={t('learn.nav.prev')}
        >
          ← {t('learn.nav.prev')}
        </button>
        
        <div className={styles['course__footer-info']}>
          {index + 1} / {modules.length}
        </div>
        
        <button 
          className="ds-btn ds-btn--primary ds-hover-lift" 
          onClick={onNext} 
          disabled={!hasNext} 
          title={t('learn.nav.next')}
        >
          {t('learn.nav.next')} →
        </button>
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
    <div className={styles['course__qna']}>
      <div className={styles.qna__form}>
        <input 
          className="ds-form-input" 
          type="text" 
          value={text} 
          onChange={(e) => setText(e.target.value)} 
          placeholder="Type a question" 
          id="qna-input" 
          name="question" 
        />
        <button 
          className="ds-btn ds-btn--primary" 
          onClick={add} 
          disabled={!text.trim()}
        >
          Ask
        </button>
      </div>
      {items.length === 0 ? (
        <div className="ds-text ds-text--muted">No questions yet</div>
      ) : (
        <ul className={styles.qna__list} role="list">
          {items.map(i => (
            <li key={i.id} className={styles.qna__item}>
              <div className={styles.qna__question}>
                <span className={styles['qna__question-text']}>{i.text}</span>
                <button 
                  className="ds-btn ds-btn--ghost ds-btn--sm" 
                  onClick={() => remove(i.id)} 
                  title="Remove"
                >
                  ✕
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
