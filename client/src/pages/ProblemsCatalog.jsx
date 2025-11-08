import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { listProblemsPaged, listTags } from '../services/problemsClient'
import toast from 'react-hot-toast'

// Tag pills and paginated list derived from backend
export default function ProblemsCatalog() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [tags, setTags] = useState([])
  const [selectedTags, setSelectedTags] = useState([])
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(20)
  const [totalPages, setTotalPages] = useState(0)
  const [totalItems, setTotalItems] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    let mounted = true
    async function loadTags() {
      try {
        const t = await listTags()
        if (!mounted) return
        setTags(t)
      } catch (e) {
        // Non-fatal
      }
    }
    loadTags()
    return () => { mounted = false }
  }, [])

  useEffect(() => {
    let mounted = true
    async function loadPage() {
      setLoading(true)
      try {
        const res = await listProblemsPaged({ page, size, tags: selectedTags, mode: 'any' })
        if (!mounted) return
        setItems(res?.items || [])
        setTotalPages(res?.totalPages || 0)
        setTotalItems(res?.totalItems || 0)
      } catch (e) {
        toast.error('Failed to load problems')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    loadPage()
    return () => { mounted = false }
  }, [page, size, selectedTags])

  const pills = useMemo(() => ['All', ...tags], [tags])

  function onToggleTag(tag) {
    if (tag === 'All') {
      setSelectedTags([])
      setPage(0)
      return
    }
    setSelectedTags((prev) => {
      const next = prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
      return next
    })
    setPage(0)
  }

  const onOpenProblem = (id) => {
    navigate(`/problems/${id}`)
  }

  return (
    <div className="catalog" role="region" aria-label="Problems Catalog">
      <header className="catalog__header">
        <h2>Practice Problems</h2>
        <p className="muted">Browse by tags and jump into problems</p>
      </header>

      <div className="catalog__chips" role="tablist" aria-label="Problem Tags">
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

      <section className="panel" aria-label="Problems List">
        <div className="panel__header">
          <h4>{selectedTags.length ? `Tags: ${selectedTags.join(', ')}` : 'All Problems'}</h4>
        </div>
        {loading ? (
          <div className="skeleton" aria-busy="true" />
        ) : items.length === 0 ? (
          <div className="empty-state">No problems found</div>
        ) : (
          <ul className="problem-list" role="list">
            {items.map((p) => (
              <li key={p.id} className="problem-item">
                <button className="problem-link" onClick={() => onOpenProblem(p.id)}>
                  <span className="problem-title">{p.title || p.name}</span>
                  <span className="problem-tags">
                    {(p.tags || []).map((t) => (
                      <span key={t} className="tag-pill" title={t}>{t}</span>
                    ))}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
        <div className="pagination-controls" aria-label="Page navigation" style={{ marginTop: '1rem' }}>
          <button className="btn" disabled={page <= 0} onClick={() => setPage(p => Math.max(0, p - 1))}>Prev</button>
          <button className="btn" disabled={page + 1 >= totalPages} onClick={() => setPage(p => p + 1)} style={{ marginLeft: '0.5rem' }}>Next</button>
        </div>
      </section>
    </div>
  )
}