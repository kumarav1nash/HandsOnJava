import { memo, useRef, useEffect } from 'react'
import classNames from 'classnames'

const OutputPane = memo(({ 
  stdout, 
  stderr, 
  metadata, 
  isRunning, 
  hasOutput,
  onClear 
}) => {
  const outputRef = useRef(null)
  const hasStdout = stdout && stdout.trim()
  const hasStderr = stderr && stderr.trim()
  const hasAnyOutput = hasStdout || hasStderr

  // Auto-scroll to bottom when new output arrives
  useEffect(() => {
    if (outputRef.current && hasAnyOutput) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight
    }
  }, [stdout, stderr, hasAnyOutput])

  const formatExecutionTime = (time) => {
    if (!time) return ''
    return time < 1000 ? `${time}ms` : `${(time / 1000).toFixed(2)}s`
  }

  const getStatusIcon = () => {
    if (isRunning) return '⏳'
    if (hasStderr) return '❌'
    if (hasStdout) return '✅'
    return '📝'
  }

  const getStatusText = () => {
    if (isRunning) return 'Running...'
    if (hasStderr) return 'Error'
    if (hasStdout) return 'Success'
    return 'Ready'
  }

  return (
    <div className="output-pane" role="region" aria-label="Program output">
      {/* Output Header */}
      <div className="output-pane__header">
        <div className="output-pane__status">
          <span className="output-pane__status-icon" aria-hidden="true">
            {getStatusIcon()}
          </span>
          <span className="output-pane__status-text">
            {getStatusText()}
          </span>
          {metadata?.executionTime && (
            <span className="output-pane__execution-time">
              {formatExecutionTime(metadata.executionTime)}
            </span>
          )}
        </div>
        
        {hasAnyOutput && (
          <button
            className="btn btn--ghost btn--small"
            onClick={onClear}
            title="Clear output"
            aria-label="Clear all output"
          >
            <span aria-hidden="true">🗑️</span>
            Clear
          </button>
        )}
      </div>

      {/* Output Content */}
      <div 
        ref={outputRef}
        className={classNames('output-pane__content', {
          'output-pane__content--empty': !hasAnyOutput && !isRunning,
          'output-pane__content--running': isRunning
        })}
        role="log"
        aria-live="polite"
        aria-atomic="false"
      >
        {isRunning ? (
          <div className="output-pane__loading">
            <div className="loading-spinner" aria-hidden="true">
              <div className="loading-spinner__dot"></div>
              <div className="loading-spinner__dot"></div>
              <div className="loading-spinner__dot"></div>
            </div>
            <span className="output-pane__loading-text">
              Executing your Java program...
            </span>
          </div>
        ) : hasAnyOutput ? (
          <div className="output-pane__results">
            {hasStdout && (
              <div className="output-section output-section--stdout">
                <div className="output-section__header">
                  <span className="output-section__label">
                    <span className="output-section__icon" aria-hidden="true">📤</span>
                    Standard Output
                  </span>
                </div>
                <pre 
                  className="output-section__content"
                  role="region"
                  aria-label="Program standard output"
                >
                  <code>{stdout}</code>
                </pre>
              </div>
            )}
            
            {hasStderr && (
              <div className="output-section output-section--stderr">
                <div className="output-section__header">
                  <span className="output-section__label">
                    <span className="output-section__icon" aria-hidden="true">⚠️</span>
                    Error Output
                  </span>
                </div>
                <pre 
                  className="output-section__content"
                  role="region"
                  aria-label="Program error output"
                >
                  <code>{stderr}</code>
                </pre>
              </div>
            )}
            
            {metadata && (
              <div className="output-section output-section--metadata">
                <div className="output-section__header">
                  <span className="output-section__label">
                    <span className="output-section__icon" aria-hidden="true">ℹ️</span>
                    Execution Details
                  </span>
                </div>
                <div className="metadata">
                  {metadata.executionTime && (
                    <div className="metadata__item">
                      <span className="metadata__label">Execution Time:</span>
                      <span className="metadata__value">
                        {formatExecutionTime(metadata.executionTime)}
                      </span>
                    </div>
                  )}
                  {metadata.memoryUsage && (
                    <div className="metadata__item">
                      <span className="metadata__label">Memory Usage:</span>
                      <span className="metadata__value">{metadata.memoryUsage}</span>
                    </div>
                  )}
                  {metadata.exitCode !== undefined && (
                    <div className="metadata__item">
                      <span className="metadata__label">Exit Code:</span>
                      <span className={classNames('metadata__value', {
                        'metadata__value--success': metadata.exitCode === 0,
                        'metadata__value--error': metadata.exitCode !== 0
                      })}>
                        {metadata.exitCode}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="output-pane__empty">
            <div className="output-pane__empty-icon" aria-hidden="true">
              📝
            </div>
            <p className="output-pane__empty-text">
              No output yet. Run your Java program to see results here.
            </p>
            <p className="output-pane__empty-hint">
              Press <kbd>⌘</kbd> + <kbd>Enter</kbd> (or <kbd>Ctrl</kbd> + <kbd>Enter</kbd>) to run
            </p>
          </div>
        )}
      </div>
    </div>
  )
})

OutputPane.displayName = 'OutputPane'

export default OutputPane