import { useMemo, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useI18n } from '../../i18n/useI18n.js'
import { findConcept, concepts } from './concepts'
import { getConcept } from '../../services/learnApi'
import InlineCodeRunner from './InlineCodeRunner'
import styles from './Concept.module.css'

export default function Concept({ conceptId, hideNav }) {
  const navigate = useNavigate()
  const useApi = import.meta.env.VITE_LEARN_USE_API === 'true'
  const [apiConcept, setApiConcept] = useState(null)
  useEffect(() => {
    if (!useApi) return
    getConcept(conceptId)
      .then(json => setApiConcept(json?.data || null))
      .catch(() => setApiConcept(null))
  }, [useApi, conceptId])
  const concept = useMemo(() => useApi ? apiConcept : findConcept(conceptId), [useApi, apiConcept, conceptId])
  const { t } = useI18n()

  useEffect(() => {
    if (!concept) navigate('/learn')
  }, [concept, navigate])

  const currentIndex = useMemo(() => concepts.findIndex(c => c.id === conceptId), [conceptId])
  const prevId = currentIndex > 0 ? concepts[currentIndex - 1]?.id : null
  const nextId = currentIndex >= 0 && currentIndex + 1 < concepts.length ? concepts[currentIndex + 1]?.id : null

  const goPrev = () => { if (prevId) navigate(`/learn/${prevId}`) }
  const goNext = () => { if (nextId) navigate(`/learn/${nextId}`) }

  if (!concept) return null

  return (
    <div className={`${styles.concept} ds-animate-fade-in-up`}>
      <header className={styles.concept__header}>
        <div className={styles.concept__nav}>
          <h1 className={`${styles.concept__title} ds-display--small`}>{concept.title}</h1>
          {!hideNav && (
            <button 
              className="ds-btn ds-btn--secondary ds-hover-lift" 
              onClick={goPrev} 
              disabled={!prevId} 
              title={t('learn.nav.prev')}
            >
              ← {t('learn.nav.prev')}
            </button>
          )}
        </div>
        <p className={`${styles.concept__summary} ds-lead`}>{concept.summary}</p>
      </header>

      <section className={styles['concept-content']}>
        <div className={`${styles.concept__section} ds-animate-slide-in-right`}>
          <h2 className={`${styles['concept__section-title']} ds-heading--2`}>Overview</h2>
          <p className={styles.concept__overview}>{String(concept.overview || '').replace(/<[^>]+>/g, '')}</p>
        </div>

        {concept.starterCode && (
          <div className={`${styles.concept__example} ds-animate-slide-in-left`}>
            <h3 className={`${styles['concept__example-title']} ds-heading--3`}>Example</h3>
            <InlineCodeRunner initialCode={concept.starterCode} />
          </div>
        )}

        {concept.steps && concept.steps.length > 0 && (
          <div className={`${styles.concept__steps} ds-animate-stagger`}>
            <h2 className={`${styles['concept__steps-title']} ds-heading--2`}>{t('learn.steps.title')}</h2>
            {concept.steps.map((step, i) => (
              <div key={step.id} className={`${styles.concept__step} ds-card ds-card--elevated`} style={{ animationDelay: `${i * 150}ms` }}>
                <h3 className={styles['concept__step-header']}>
                  <span className={styles['concept__step-number']}>{i + 1}</span>
                  {step.description}
                </h3>

                {step.hint && (
                  <div className={styles['concept__step-hint']}>
                    <strong>Hint:</strong> {step.hint}
                  </div>
                )}

                <div className={styles['concept__step-try']}>
                  <p className="ds-text ds-text--muted">Try it out:</p>
                  <InlineCodeRunner initialCode={concept.starterCode} />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {!hideNav && (
        <div className={`${styles.concept__actions} ds-animate-fade-in-up`}>
          <p className={styles['concept__actions-text']}>Ready to test your knowledge?</p>
          <button 
            className="ds-btn ds-btn--primary ds-btn--lg ds-hover-lift" 
            onClick={goNext} 
            disabled={!nextId}
          >
            Next: Practice & Quiz →
          </button>
        </div>
      )}
    </div>
  )
}
