import { useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useI18n } from '../../i18n/useI18n.js'
import { findConcept, concepts } from './concepts'
import InlineCodeRunner from './InlineCodeRunner'

export default function Concept({ conceptId, hideNav }) {
  const navigate = useNavigate()
  const concept = useMemo(() => findConcept(conceptId), [conceptId])
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
    <div className="concept-page" style={{
      height: '100%',
      overflowY: 'auto',
      padding: '2rem',
      maxWidth: 'var(--content-width, 800px)',
      margin: '0 auto'
    }}>
      <header style={{ marginBottom: '2rem', borderBottom: '1px solid var(--border-color, #333)', paddingBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <h1 style={{ margin: 0, fontSize: '2rem' }}>{concept.title}</h1>
          {!hideNav && (
            <div className="toolbar">
              <button className="btn" onClick={goPrev} disabled={!prevId} title={t('learn.nav.prev')}>← {t('learn.nav.prev')}</button>
            </div>
          )}
        </div>
        <p className="muted" style={{ fontSize: '1.1rem', lineHeight: '1.6' }}>{concept.summary}</p>
      </header>

      <section className="concept-content">
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Overview</h2>
          <p style={{ lineHeight: '1.7', fontSize: '1.05rem', whiteSpace: 'pre-wrap' }}>{concept.overview}</p>
        </div>

        {concept.starterCode && (
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Example</h3>
            <InlineCodeRunner initialCode={concept.starterCode} />
          </div>
        )}

        {concept.steps && concept.steps.length > 0 && (
          <div className="concept-steps">
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', marginTop: '3rem' }}>{t('learn.steps.title')}</h2>
            {concept.steps.map((step, i) => (
              <div key={step.id} className="step-card" style={{
                marginBottom: '2rem',
                padding: '1.5rem',
                background: 'var(--bg-secondary, #1e1e1e)',
                borderRadius: '8px',
                border: '1px solid var(--border-color, #333)'
              }}>
                <h3 style={{ marginTop: 0, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{
                    background: 'var(--primary-color, #646cff)',
                    color: 'white',
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.85rem'
                  }}>{i + 1}</span>
                  {step.description}
                </h3>

                {step.hint && (
                  <div style={{
                    background: 'rgba(100, 108, 255, 0.1)',
                    borderLeft: '4px solid var(--primary-color, #646cff)',
                    padding: '0.75rem',
                    margin: '1rem 0',
                    borderRadius: '0 4px 4px 0'
                  }}>
                    <strong>Hint:</strong> {step.hint}
                  </div>
                )}

                <div style={{ marginTop: '1rem' }}>
                  <p className="muted" style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>Try it out:</p>
                  {/* We use a simple template for the step if no specific code is provided, or just a blank starter */}
                  <InlineCodeRunner initialCode={concept.starterCode} />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {!hideNav && (
        <div style={{ marginTop: '4rem', textAlign: 'center', paddingBottom: '2rem' }}>
          <p className="muted">Ready to test your knowledge?</p>
          <button className="btn btn--primary btn--lg" onClick={goNext} disabled={!nextId}>
            Next: Practice & Quiz →
          </button>
        </div>
      )}
    </div>
  )
}