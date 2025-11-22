import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { courses } from './courses'
import { useI18n } from '../../i18n/useI18n.js'

export default function Courses() {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()
  const { t } = useI18n()

  const filtered = useMemo(() => {
    return courses.filter(c => {
      const q = query.toLowerCase()
      return !q || c.title.toLowerCase().includes(q) || c.summary.toLowerCase().includes(q)
    })
  }, [query])

  const openCourse = (id) => navigate(`/learn/course/${id}`)

  return (
    <div className="catalog" role="region" aria-label={t('learn.title')}>
      <header className="catalog__header">
        <h2>{t('learn.title')}</h2>
        <p className="muted">{t('learn.subtitle')}</p>
      </header>
      <div className="catalog__controls" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '1.5rem' }}>
        <input
          className="input"
          type="search"
          placeholder={t('learn.search.placeholder')}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label={t('learn.search.placeholder')}
          id="courses-search"
          name="query"
          style={{ maxWidth: '400px' }}
        />
      </div>
      <section className="panel" aria-label="Courses List" style={{ background: 'transparent', border: 'none', padding: 0 }}>
        {filtered.length === 0 ? (
          <div className="empty-state">No courses found</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {filtered.map((c) => (
              <div key={c.id} className="card" style={{
                background: 'var(--bg-secondary, #1e1e1e)',
                border: '1px solid var(--border-color, #333)',
                borderRadius: '8px',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s, border-color 0.2s',
                cursor: 'pointer'
              }}
                onClick={() => openCourse(c.id)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)'
                  e.currentTarget.style.borderColor = 'var(--primary-color, #646cff)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none'
                  e.currentTarget.style.borderColor = 'var(--border-color, #333)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{c.title}</h3>
                  <span className="tag-pill" title={c.level} style={{ fontSize: '0.75rem' }}>{c.level}</span>
                </div>
                <p className="muted" style={{ margin: '0 0 1.5rem 0', flex: 1, lineHeight: '1.6' }}>{c.summary}</p>
                <button className="btn btn--primary" style={{ width: '100%' }}>Start Learning</button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}