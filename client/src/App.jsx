import { useState } from 'react'
import './App.css'
import EditorPane from './components/EditorPane'
import { runJava } from './services/compilerClient'

function App() {
  const [code, setCode] = useState(`public class Main {\n    public static void main(String[] args) {\n        System.out.println(\"Hello, World!\");\n    }\n}`)
  const [stdin, setStdin] = useState('')
  const [running, setRunning] = useState(false)
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')

  const onRun = async () => {
    setRunning(true)
    setOutput('')
    setError('')
    try {
      const result = await runJava(code, stdin)
      setOutput(result.stdout)
      setError(result.stderr)
    } catch (e) {
      setError(e?.message || 'Unexpected error')
    } finally {
      setRunning(false)
    }
  }

  return (
    <div className="app">
      <header className="app__header">
        <img src="/vite.svg" className="logo" alt="Vite logo" />
        <h1>Java Online Compiler</h1>
      </header>
      <main className="app__main">
        <section className="pane pane--editor">
          <EditorPane value={code} onChange={setCode} language="java" />
        </section>
        <section className="pane pane--controls">
          <div className="controls">
            <label className="label">Program Input (stdin)</label>
            <textarea
              className="input"
              rows={6}
              value={stdin}
              onChange={(e) => setStdin(e.target.value)}
              placeholder="Type input for program here"
            />
            <button className="btn" onClick={onRun} disabled={running}>
              {running ? 'Running…' : 'Run'}
            </button>
          </div>
          <div className="outputs">
            <div className="output">
              <div className="output__title">Stdout</div>
              <pre className="output__content">{output || ' '}</pre>
            </div>
            <div className="output">
              <div className="output__title">Stderr</div>
              <pre className="output__content error">{error || ' '}</pre>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
