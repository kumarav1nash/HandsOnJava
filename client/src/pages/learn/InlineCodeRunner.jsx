import { useState, useCallback } from 'react'
import { runJava } from '../../services/compilerClient'
import EditorPane from '../../components/EditorPane'

export default function InlineCodeRunner({ initialCode, readOnly = false }) {
    const [code, setCode] = useState(initialCode || '')
    const [output, setOutput] = useState(null)
    const [running, setRunning] = useState(false)
    const [error, setError] = useState(null)

    const handleRun = useCallback(async () => {
        if (!code.trim()) return
        setRunning(true)
        setOutput(null)
        setError(null)

        try {
            const res = await runJava(code, '')
            if (res.exitCode === 0) {
                setOutput(res.stdout)
            } else {
                setError(res.stderr || 'Execution failed')
                setOutput(res.stdout) // Show stdout even if failed
            }
        } catch (e) {
            setError(e.message || 'An error occurred')
        } finally {
            setRunning(false)
        }
    }, [code])

    return (
        <div className="inline-runner" style={{
            margin: '1.5rem 0',
            border: '1px solid var(--border-color, #333)',
            borderRadius: '8px',
            overflow: 'hidden',
            background: 'var(--bg-secondary, #1e1e1e)'
        }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.5rem 1rem',
                borderBottom: '1px solid var(--border-color, #333)',
                background: 'var(--bg-primary, #242424)'
            }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted, #999)' }}>Java Code</span>
                {!readOnly && (
                    <button
                        className="btn btn--primary btn--sm"
                        onClick={handleRun}
                        disabled={running}
                        style={{ padding: '0.25rem 0.75rem', fontSize: '0.85rem' }}
                    >
                        {running ? 'Running...' : 'Run'}
                    </button>
                )}
            </div>

            <div style={{ padding: '0' }}>
                <EditorPane
                    value={code}
                    onChange={setCode}
                    language="java"
                    theme="vs-dark"
                    height="200px"
                    readOnly={readOnly}
                    minimap={false}
                />
            </div>

            {(output !== null || error !== null) && (
                <div style={{
                    padding: '1rem',
                    borderTop: '1px solid var(--border-color, #333)',
                    background: '#111',
                    fontFamily: 'monospace',
                    fontSize: '0.9rem'
                }}>
                    {error && <div style={{ color: '#ff6b6b', marginBottom: output ? '0.5rem' : 0 }}>{error}</div>}
                    {output && <div style={{ whiteSpace: 'pre-wrap' }}>{output}</div>}
                </div>
            )}
        </div>
    )
}
