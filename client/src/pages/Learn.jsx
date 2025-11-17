import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { concepts } from './learn/concepts'
import { useI18n } from '../i18n/useI18n.js'

export default function Learn() {
  const [query, setQuery] = useState('')
  const [selectedTags, setSelectedTags] = useState([])
  const navigate = useNavigate()
  const { t } = useI18n()

  const tags = useMemo(() => {
    const set = new Set()
    concepts.forEach(c => (c.tags || []).forEach(t => set.add(t)))
    return Array.from(set)
  }, [])

  const pills = useMemo(() => ['All', ...tags], [tags])

  const filtered = useMemo(() => {
    return concepts.filter(c => {
      const matchesQuery = !query || (
        c.title.toLowerCase().includes(query.toLowerCase()) ||
        c.summary.toLowerCase().includes(query.toLowerCase())
      )
      const matchesTags = selectedTags.length === 0 || selectedTags.every(t => c.tags?.includes(t))
      return matchesQuery && matchesTags
    })
  }, [query, selectedTags])

  function onToggleTag(tag) {
    if (tag === 'All') {
      setSelectedTags([])
      return
    }
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])
  }

  function openConcept(id) {
    navigate(`/learn/${id}`)
  }

  return (
    <div className="catalog" role="region" aria-label={t('learn.title')}>
      <header className="catalog__header">
        <h2>{t('learn.title')}</h2>
        <p className="muted">{t('learn.subtitle')}</p>
      </header>

      <div className="catalog__controls" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '0.75rem' }}>
        <input
          className="input"
          type="search"
          placeholder={t('learn.search.placeholder')}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label={t('learn.search.placeholder')}
          id="learn-search"
          name="query"
        />
      </div>

      <div className="catalog__chips" role="tablist" aria-label={t('learn.tags.aria')}>
        {pills.map((t) => {
          const active = t === 'All' ? selectedTags.length === 0 : selectedTags.includes(t)
          return (
            <button
              key={t}
              role="tab"
              aria-selected={active}
              className={`chip ${active ? 'active' : ''}`}
              onClick={() => onToggleTag(t)}
            >
              <span className="chip__label">{t}</span>
            </button>
          )
        })}
      </div>

      <section className="panel" aria-label="Concepts List">
        <div className="panel__header">
          <h4>{selectedTags.length ? `Tags: ${selectedTags.join(', ')}` : 'All Concepts'}</h4>
        </div>
        {filtered.length === 0 ? (
          <div className="empty-state">No concepts found</div>
        ) : (
          <ul className="problem-list" role="list">
            {filtered.map((c) => (
              <li key={c.id} className="problem-item">
                <button className="problem-link" onClick={() => openConcept(c.id)}>
                  <span className="problem-title">{c.title}</span>
                  <span className="problem-tags">
                    {(c.tags || []).map((t) => (
                      <span key={t} className="tag-pill" title={t}>{t}</span>
                    ))}
                    <span className="tag-pill" title={c.difficulty}>{c.difficulty}</span>
                  </span>
                  <span className="muted" style={{ display: 'block', marginTop: '0.25rem' }}>{c.summary}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}