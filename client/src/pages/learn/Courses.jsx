import { useMemo, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { courses as localCourses } from './courses'
import { getCourses } from '../../services/learnApi'
import { useI18n } from '../../i18n/useI18n.js'
import styles from './Courses.module.css'

export default function Courses() {
  const navigate = useNavigate()
  const { t } = useI18n()

  const useApi = import.meta.env.VITE_LEARN_USE_API === 'true'
  const [apiCourses, setApiCourses] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!useApi) return
    setLoading(true)
    setError('')
    getCourses()
      .then(json => {
        const list = json?.data || []
        setApiCourses(list)
      })
      .catch(e => setError(e.message || 'Failed to load courses'))
      .finally(() => setLoading(false))
  }, [useApi])

  const sourceCourses = useApi ? apiCourses : localCourses

  const coursesWithProgress = useMemo(() => {
    return sourceCourses.map(course => {
      const progressKey = `course_progress_${course.id}`
      try {
        const raw = localStorage.getItem(progressKey)
        if (raw) {
          const saved = JSON.parse(raw)
          const modules = course.modules || (course.conceptIds || []).map(id => ({ type: 'concept', id }))
          const progress = saved.index !== undefined ? Math.round(((saved.index + 1) / modules.length) * 100) : 0
          return { ...course, progress, started: saved.index > 0 }
        }
      } catch { }
      return { ...course, progress: 0, started: false }
    })
  }, [sourceCourses])

  const openCourse = (id) => navigate(`/learn/course/${id}`)

  return (
    <div className={`${styles.courses} ds-animate-fade-in`} role="region" aria-label={t('learn.title')}>
      <header className={`${styles.courses__header} ds-animate-fade-in-up`}>
        <h1 className={`${styles.courses__title} ds-display--small`}>{t('learn.title')}</h1>
        <p className={`${styles.courses__subtitle} ds-lead`}>{t('learn.subtitle')}</p>
      </header>
      
      <section className="ds-section" aria-label="Courses List">
        {loading ? (
          <div className={`${styles.courses__empty} empty-state`}>
            <div className="empty-state__icon">⏳</div>
            <h3 className={styles['courses__empty-title']}>Loading courses...</h3>
          </div>
        ) : error ? (
          <div className={`${styles.courses__empty} empty-state`}>
            <div className="empty-state__icon">⚠️</div>
            <h3 className={styles['courses__empty-title']}>Failed to load courses</h3>
            <p className={styles['courses__empty-description']}>{error}</p>
          </div>
        ) : coursesWithProgress.length === 0 ? (
          <div className={`${styles.courses__empty} empty-state ds-animate-scale-in`}>
            <div className="empty-state__icon">📚</div>
            <h3 className={styles['courses__empty-title']}>No courses available</h3>
            <p className={styles['courses__empty-description']}>
              Check back later for new courses.
            </p>
          </div>
        ) : (
          <div className={`${styles.courses__grid} ds-animate-stagger`}>
            {coursesWithProgress.map((c, index) => (
              <div 
                key={c.id} 
                className={`${styles['course-card']} ds-card ds-card--elevated ds-card--interactive`}
                onClick={() => openCourse(c.id)}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={styles['course-card__header']}>
                  <h3 className={styles['course-card__title']}>{c.title}</h3>
                  <span 
                    className={`ds-tag ds-tag--${(c.level || 'Beginner').toLowerCase()} ds-tag--sm ds-tag--interactive`}
                    title={c.level}
                  >
                    {c.level || 'Beginner'}
                  </span>
                </div>
                <p className={styles['course-card__description']}>
                  {c.summary}
                </p>
                {c.started && (
                  <div className={styles['course-card__progress']}>
                    <div className={styles['course-card__progress-header']}>
                      <span className={styles['course-card__progress-label']}>
                        Progress
                      </span>
                      <span className={styles['course-card__progress-value']}>
                        {c.progress}%
                      </span>
                    </div>
                    <div className={styles['course-card__progress-bar']}>
                      <div 
                        className={styles['course-card__progress-fill']}
                        style={{ width: `${c.progress}%` }}
                      />
                    </div>
                  </div>
                )}
                <button className="ds-btn ds-btn--primary ds-btn--lg ds-btn--block ds-hover-lift">
                  {c.started ? 'Continue Learning' : 'Start Learning'}
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
