import { useEffect, useState, useMemo, useCallback, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import './App.css'
import { useI18n } from './i18n/useI18n.js'
import EditorPane from './components/EditorPane'
import ContextMenu from './design-system/components/ContextMenu'
import ProblemsSection from './components/ProblemsSection'
import AdminPanel from './components/AdminPanel'
import ProblemsCatalog from './pages/ProblemsCatalog.jsx'
import Header from './components/Header'
import OutputPane from './components/OutputPane'
import { runJava } from './services/compilerClient'
import SplitPane from './design-system/components/SplitPane'
import toast, { Toaster } from 'react-hot-toast'
import classNames from 'classnames'

function App() {
  const [code, setCode] = useState(`public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}`)
  const [stdin, setStdin] = useState('')
  const [running, setRunning] = useState(false)
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [meta, setMeta] = useState(null)
  const [theme, setTheme] = useState('vs-dark')
  const [mode, setMode] = useState(localStorage.getItem('app_mode') || 'Compiler')
  const [lastSaved, setLastSaved] = useState(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  
  const editorRef = useRef(null)
  const runButtonRef = useRef(null)

  // Load saved data on mount
  useEffect(() => {
    const savedCode = localStorage.getItem('java_code')
    const savedStdin = localStorage.getItem('java_stdin')
    const savedTheme = localStorage.getItem('editor_theme')
    
    if (savedCode) {
      setCode(savedCode)
      setLastSaved(new Date())
    }
    if (savedStdin) setStdin(savedStdin)
    if (savedTheme) setTheme(savedTheme)

    // Apply theme to document
    document.documentElement.setAttribute('data-theme', savedTheme === 'vs' ? 'light' : 'dark')
  }, [])

  // Auto-save code with debouncing
  useEffect(() => {
    setHasUnsavedChanges(true)
    const id = setTimeout(() => {
      localStorage.setItem('java_code', code)
      setLastSaved(new Date())
      setHasUnsavedChanges(false)
    }, 800)
    return () => clearTimeout(id)
  }, [code])

  // Auto-save stdin
  useEffect(() => {
    const id = setTimeout(() => {
      localStorage.setItem('java_stdin', stdin)
    }, 500)
    return () => clearTimeout(id)
  }, [stdin])

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const onRun = useCallback(async () => {
    if (!isOnline) {
      toast.error('No internet connection')
      return
    }

    if (!code.trim()) {
      toast.error('Please enter some code first')
      return
    }

    setRunning(true)
    setOutput('')
    setError('')
    setMeta(null)
    
    const startTime = Date.now()
    const loadingToast = toast.loading('Compiling and running...')
    
    try {
      const result = await runJava(code, stdin)
      const duration = Date.now() - startTime
      
      setOutput(result.stdout)
      setError(result.stderr)
      setMeta({ 
        exitCode: result.exitCode, 
        durationMs: result.durationMs || duration,
        compiledAt: new Date().toLocaleTimeString()
      })
      
      toast.dismiss(loadingToast)
      
      if (result.exitCode === 0) {
        toast.success(`Executed successfully in ${result.durationMs || duration}ms`)
      } else {
        toast.error(`Process exited with code ${result.exitCode}`)
      }
    } catch (e) {
      toast.dismiss(loadingToast)
      const errorMessage = e?.message || 'Unexpected error occurred'
      setError(errorMessage)
      setMeta({ 
        exitCode: -1, 
        durationMs: Date.now() - startTime,
        compiledAt: new Date().toLocaleTimeString(),
        error: true
      })
      toast.error('Compilation failed')
    } finally {
      setRunning(false)
    }
  }, [code, stdin, isOnline])

  const onThemeToggle = useCallback(() => {
    const next = theme === 'vs-dark' ? 'vs' : 'vs-dark'
    setTheme(next)
    localStorage.setItem('editor_theme', next)
    document.documentElement.setAttribute('data-theme', next === 'vs' ? 'light' : 'dark')
    toast.success(`Switched to ${next === 'vs' ? 'light' : 'dark'} theme`)
  }, [theme])

  const onModeToggle = useCallback((next) => {
    setMode(next)
    localStorage.setItem('app_mode', next)
  }, [])

  const onClearOutput = useCallback(() => {
    setOutput('')
    setError('')
    setMeta(null)
    toast('Output cleared')
  }, [])

  const onCopyCode = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code)
      toast.success('Code copied to clipboard')
    } catch (e) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = code
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      toast.success('Code copied to clipboard')
    }
  }, [code])

  const onLoadExample = useCallback((exampleCode) => {
    setCode(exampleCode)
    toast.success('Example loaded')
  }, [])

  // Routing: sync mode with URL for Admin route
  const location = useLocation()
  const navigate = useNavigate()

  // Derive active mode for header highlighting
  // Treat /admin as Admin, and /catalog or /problems as Problems
  const activeMode = location.pathname.startsWith('/admin')
    ? 'Admin'
    : (location.pathname.startsWith('/catalog') || location.pathname.startsWith('/problems'))
      ? 'Problems'
      : mode

  // When user toggles Admin from header, navigate to /admin. For others, navigate to /
  const onNavMode = useCallback((next) => {
    if (next === 'Admin') {
      if (!location.pathname.startsWith('/admin')) navigate('/admin')
      setMode('Admin')
      localStorage.setItem('app_mode', 'Admin')
    } else if (next === 'Problems') {
      if (!location.pathname.startsWith('/catalog') && !location.pathname.startsWith('/problems')) {
        navigate('/catalog')
      }
      setMode('Problems')
      localStorage.setItem('app_mode', 'Problems')
    } else {
      if (location.pathname.startsWith('/admin') || location.pathname.startsWith('/catalog') || location.pathname.startsWith('/problems')) {
        navigate('/')
      }
      setMode(next)
      localStorage.setItem('app_mode', next)
    }
  }, [location.pathname, navigate])

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      const isMac = navigator.platform.toUpperCase().includes('MAC')
      const runShortcut = (isMac && e.metaKey && e.key === 'Enter') || (!isMac && e.ctrlKey && e.key === 'Enter')
      const saveShortcut = (isMac && e.metaKey && e.key === 's') || (!isMac && e.ctrlKey && e.key === 's')
      
      if (runShortcut && !running) {
        e.preventDefault()
        onRun()
      } else if (saveShortcut) {
        e.preventDefault()
        localStorage.setItem('java_code', code)
        setLastSaved(new Date())
        setHasUnsavedChanges(false)
        toast.success('Code saved')
      }
    }
    
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onRun, running, code])

  // Focus management
  const focusEditor = useCallback(() => {
    if (editorRef.current) {
      editorRef.current.focus()
    }
  }, [])

  const examples = useMemo(() => [
    {
      name: 'Hello World',
      code: `public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}`
    },
    {
      name: 'Input/Output',
      code: `import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner scanner = new Scanner(System.in);\n        System.out.print("Enter your name: ");\n        String name = scanner.nextLine();\n        System.out.println("Hello, " + name + "!");\n        scanner.close();\n    }\n}`
    },
    {
      name: 'Loop Example',
      code: `public class Main {\n    public static void main(String[] args) {\n        for (int i = 1; i <= 10; i++) {\n            System.out.println("Number: " + i);\n        }\n    }\n}`
    }
  ], [])

  const { t } = useI18n()
  const [problemNav, setProblemNav] = useState(null)
  return (
    <div className="app" role="application" aria-label={t('header.title')}>
      <Header 
        onThemeToggle={onThemeToggle} 
        theme={theme}
        hasUnsavedChanges={hasUnsavedChanges}
        lastSaved={lastSaved}
        isOnline={isOnline}
        mode={activeMode}
        onModeToggle={onNavMode}
        problemNav={problemNav}
      />
      
      <main className="app__main" role="main">
        {/* Mode navigation moved to Header */}

        {location.pathname.startsWith('/admin') ? (
          <AdminPanel />
        ) : location.pathname.startsWith('/catalog') ? (
          <ProblemsCatalog />
        ) : location.pathname.startsWith('/problems') ? (
          <ProblemsSection onProblemNavChange={setProblemNav} />
        ) : activeMode === 'Compiler' ? (
          <SplitPane 
            direction="horizontal"
            sizes={[60, 40]} 
            minSize={300} 
            gutterSize={8} 
            ariaLabel="Resizable editor and output panels"
          >
            {/* Editor Panel */}
            <section 
              className="pane pane--editor" 
              role="region" 
              aria-label="Code Editor"
            >
              <div className="pane__header">
                <h2 className="pane__title">Code Editor</h2>
                <div className="toolbar">
                  <div className="toolbar__group">
                    <button 
                      ref={runButtonRef}
                      className={classNames('btn', 'btn--primary', { loading: running })}
                      onClick={onRun} 
                      disabled={running || !isOnline}
                      aria-label={running ? 'Running code' : 'Run code (Ctrl+Enter)'}
                      title="Run code (Ctrl+Enter)"
                    >
                      {running ? (
                        <>
                          <span className="btn__spinner" aria-hidden="true">⟳</span>
                          Running...
                        </>
                      ) : (
                        <>
                          <span aria-hidden="true">▶</span>
                          Run
                        </>
                      )}
                    </button>
                    
                    <button 
                      className="btn btn--secondary"
                      onClick={onClearOutput}
                      aria-label="Clear output"
                      title="Clear output"
                    >
                      <span aria-hidden="true">🗑</span>
                      Clear
                    </button>
                    
                    <button 
                      className="btn btn--secondary"
                      onClick={onCopyCode}
                      aria-label="Copy code to clipboard"
                      title="Copy code"
                    >
                      <span aria-hidden="true">📋</span>
                      Copy
                    </button>
                  </div>
                  
                  <div className="toolbar__separator" aria-hidden="true" />
                  
                  <div className="toolbar__group">
                    <select 
                      className="btn btn--ghost"
                      onChange={(e) => {
                        const example = examples[e.target.value]
                        if (example) onLoadExample(example.code)
                      }}
                      aria-label="Load code example"
                      title="Load example code"
                    >
                      <option value="">Examples</option>
                      {examples.map((example, index) => (
                        <option key={index} value={index}>
                          {example.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="editor-container">
                <ContextMenu
                  items={[
                    { id: 'run', label: 'Run', shortcut: 'Cmd/Ctrl+Enter', onSelect: onRun, disabled: running || !isOnline },
                    { id: 'copy', label: 'Copy Code', shortcut: 'Cmd/Ctrl+C', onSelect: onCopyCode },
                    { id: 'clear', label: 'Clear Output', onSelect: onClearOutput }
                  ]}
                >
                  <EditorPane 
                    ref={editorRef}
                    value={code} 
                    onChange={setCode} 
                    language="java" 
                    theme={theme} 
                    height="100%"
                    aria-label="Java code editor"
                  />
                </ContextMenu>
              </div>
            </section>

            {/* Input/Output Panel */}
            <section 
              className="pane pane--controls" 
              role="region" 
              aria-label="Program Input and Output"
            >
              <div className="pane__header">
                <h2 className="pane__title">Input & Output</h2>
              </div>
              
              <div className="controls">
                <label className="label" htmlFor="stdin-input">
                  Program Input (stdin)
                </label>
                <textarea
                  id="stdin-input"
                  className="input"
                  rows={6}
                  value={stdin}
                  onChange={(e) => setStdin(e.target.value)}
                  placeholder="Enter input for your program here..."
                  aria-describedby="stdin-help"
                />
                <div id="stdin-help" className="sr-only">
                  This input will be passed to your Java program's standard input stream
                </div>
              </div>
              
              <OutputPane 
                stdout={output}
                stderr={error}
                metadata={meta}
                isRunning={running}
                hasOutput={Boolean(output?.trim()) || Boolean(error?.trim())}
                onClear={onClearOutput}
              />
            </section>
          </SplitPane>
        ) : (
          <ProblemsCatalog />
        )}
      </main>
      
      {/* Status Bar */}
      {/* <footer className="app__status" role="contentinfo" aria-label="Application status">
        <div className="status__item">
          <span className="status__label">Status:</span>
          <span className={classNames('status__value', {
            'status__value--online': isOnline,
            'status__value--offline': !isOnline
          })}>
            {isOnline ? 'Online' : 'Offline'}
          </span>
        </div>
        
        {lastSaved && (
          <div className="status__item">
            <span className="status__label">Last saved:</span>
            <span className="status__value">
              {lastSaved.toLocaleTimeString()}
            </span>
          </div>
        )}
        
        {hasUnsavedChanges && (
          <div className="status__item">
            <span className="status__indicator status__indicator--unsaved" aria-label="Unsaved changes">
              ●
            </span>
            <span className="status__value">Unsaved changes</span>
          </div>
        )}
      </footer> */}
      
      <Toaster 
        position="bottom-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'var(--color-surface)',
            color: 'var(--color-text-primary)',
            border: '1px solid var(--color-border)',
          },
          success: {
            iconTheme: {
              primary: 'var(--color-success)',
              secondary: 'var(--color-surface)',
            },
          },
          error: {
            iconTheme: {
              primary: 'var(--color-error)',
              secondary: 'var(--color-surface)',
            },
          },
        }}
      />
      
      {/* Screen reader announcements */}
      <div 
        className="sr-only" 
        role="status" 
        aria-live="polite" 
        aria-atomic="true"
      >
        {running && 'Code is running...'}
        {!isOnline && 'Application is offline'}
      </div>
    </div>
  )
}

export default App
