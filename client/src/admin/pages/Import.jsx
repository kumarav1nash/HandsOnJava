import { useState, useMemo } from 'react'

export default function Import() {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState({ headers: [], rows: [] })
  const [dryRun, setDryRun] = useState(true)
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(20)
  const adminToken = import.meta.env.VITE_ADMIN_TOKEN || ''

  const handleFileChange = (e) => {
    setFile(e.target.files?.[0] || null)
    setStatus(null)
    const f = e.target.files?.[0]
    if (f) {
      f.text().then((text) => {
        const parsed = parseCsvText(text)
        setPreview(parsed)
        setPage(0)
      }).catch(() => setPreview({ headers: [], rows: [] }))
    } else {
      setPreview({ headers: [], rows: [] })
    }
  }

  const upload = async () => {
    if (!file) {
      setStatus({ error: 'Please select a CSV file to upload.' })
      return
    }
    if (!adminToken) {
      setStatus({ error: 'Admin token is not configured in the client.' })
      return
    }
    setLoading(true)
    try {
      const text = await file.text()
      const res = await fetch(`/api/admin/import/problems/csv?dryRun=${dryRun ? 'true' : 'false'}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/csv',
          'X-Admin-Token': adminToken,
        },
        body: text,
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setStatus({ error: data?.message || `Import failed: ${res.status}` })
      } else {
        setStatus({ ok: true, data })
      }
    } catch (err) {
      setStatus({ error: err?.message || 'Unexpected error during upload.' })
    } finally {
      setLoading(false)
    }
  }

  // --- CSV preview helpers ---
  function parseCsvLine(line) {
    const out = []
    let cur = ''
    let inQuotes = false
    for (let i = 0; i < line.length; i++) {
      const ch = line[i]
      if (ch === '"') {
        // Handle doubled quotes inside quoted fields
        if (inQuotes && line[i + 1] === '"') {
          cur += '"'
          i++
        } else {
          inQuotes = !inQuotes
        }
      } else if (ch === ',' && !inQuotes) {
        out.push(cur)
        cur = ''
      } else {
        cur += ch
      }
    }
    out.push(cur)
    return out
  }

  function parseCsvText(text) {
    const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0)
    if (lines.length === 0) return { headers: [], rows: [] }
    const headers = parseCsvLine(lines[0])
    const rows = []
    for (let i = 1; i < lines.length; i++) {
      rows.push(parseCsvLine(lines[i]))
    }
    return { headers, rows }
  }

  const columns = useMemo(() => {
    const wanted = ['id','title','constraints','tags','isSample','input','expectedOutput']
    if (!preview.headers || preview.headers.length === 0) return []
    const idx = Object.fromEntries(preview.headers.map((h, i) => [h.trim(), i]))
    return wanted.map((h) => ({ key: h, index: idx[h] ?? -1 }))
  }, [preview])

  const pageRows = useMemo(() => {
    const start = page * size
    const end = Math.min(start + size, preview.rows.length)
    return preview.rows.slice(start, end)
  }, [preview.rows, page, size])

  return (
    <div className="pane" aria-label="Admin CSV Import">
      <h2 style={{ marginBottom: 'var(--space-md)' }}>Import Problems from CSV</h2>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-md)' }}>
        Upload a CSV with columns: <code>id,title,statement,inputSpec,outputSpec,constraints,tags,isSample,input,expectedOutput</code>.
        The <code>tags</code> column is optional; when omitted, the server accepts the legacy 9-column format.
      </p>
      <div style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
        <input type="file" accept=".csv,text/csv" onChange={handleFileChange} aria-label="CSV file input" />
        <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <input type="checkbox" checked={dryRun} onChange={(e) => setDryRun(e.target.checked)} />
          <span>Dry run (validate only)</span>
        </label>
        <button className="btn" onClick={upload} disabled={loading}>
          {loading ? 'Uploading…' : dryRun ? 'Validate CSV' : 'Import CSV'}
        </button>
      </div>

      {status?.error && (
        <div className="callout callout--error" role="alert" style={{ marginTop: 'var(--space-md)' }}>
          {status.error}
        </div>
      )}

      {status?.ok && (
        <div className="callout callout--success" role="status" style={{ marginTop: 'var(--space-md)' }}>
          <div style={{ marginBottom: '0.5rem' }}>{status.data?.message || 'Success'}</div>
          <div style={{ display: 'flex', gap: '2rem' }}>
            <div><strong>Mode:</strong> {status.data?.mode}</div>
            <div><strong>Problems:</strong> {status.data?.problems}</div>
            <div><strong>Test cases:</strong> {status.data?.testcases}</div>
          </div>
        </div>
      )}

      {preview.rows.length > 0 && (
        <div style={{ marginTop: 'var(--space-lg)' }}>
          <h3 style={{ marginBottom: 'var(--space-sm)' }}>CSV Preview</h3>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '0.5rem' }}>
            <label htmlFor="csv-page-size">Page size</label>
            <select id="csv-page-size" value={size} onChange={(e) => { setSize(Number(e.target.value)); setPage(0) }}>
              {[10,20,50,100].map((n) => (<option key={n} value={n}>{n}</option>))}
            </select>
            <button className="btn" disabled={page <= 0} onClick={() => setPage(p => Math.max(0, p - 1))}>Prev</button>
            <span className="muted">Page {page + 1} of {Math.max(1, Math.ceil(preview.rows.length / size))}</span>
            <button className="btn" disabled={(page + 1) >= Math.ceil(preview.rows.length / size)} onClick={() => setPage(p => p + 1)}>Next</button>
          </div>
          <div style={{ overflow: 'auto', border: '1px solid var(--color-border)', borderRadius: '6px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead style={{ background: 'var(--color-bg-muted)' }}>
                <tr>
                  {columns.map((c) => (
                    <th key={c.key} style={{ textAlign: 'left', padding: '0.5rem', borderBottom: '1px solid var(--color-border)' }}>{c.key}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pageRows.map((row, i) => (
                  <tr key={i}>
                    {columns.map((c) => (
                      <td key={c.key} style={{ padding: '0.5rem', borderBottom: '1px solid var(--color-border)', whiteSpace: 'nowrap', maxWidth: '24ch', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {c.index >= 0 ? row[c.index] : ''}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: '0.5rem', color: 'var(--color-text-muted)' }}>
            Showing rows {page * size + 1}–{Math.min((page + 1) * size, preview.rows.length)} of {preview.rows.length}.
          </div>
        </div>
      )}

      <div style={{ marginTop: 'var(--space-lg)', color: 'var(--color-text-muted)' }}>
        <p>
          Tip: For hidden tests, set <code>isSample</code> to <code>false</code>. Visible sample tests should use <code>true</code>.
        </p>
        <p>
          Server must have <code>ADMIN_TOKEN</code> configured and <code>storage.type=jpa</code> for imports.
        </p>
      </div>
    </div>
  )
}