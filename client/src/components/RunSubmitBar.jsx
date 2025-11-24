import classNames from 'classnames'

const RunSubmitBar = ({ onRun, onSubmit, running, submitting }) => {
  return (
    <div className="run-submit-bar" role="toolbar" aria-label="Run and submit actions">
      <div className="run-submit-bar__actions">
        <button 
          className={classNames('ds-btn', 'ds-btn--primary', { 'ds-btn--loading': running })}
          onClick={onRun}
          disabled={running || submitting}
          aria-label={running ? 'Running sample tests' : 'Run sample tests'}
          title="Run sample tests (Ctrl/Cmd+Enter)"
        >
          {running ? 'Running…' : 'Run'}
        </button>
        <button 
          className={classNames('ds-btn', 'ds-btn--success', { 'ds-btn--loading': submitting })}
          onClick={onSubmit} 
          title="Submit solution"
          disabled={running || submitting}
        >
          {submitting ? 'Submitting…' : 'Submit'}
        </button>
      </div>
    </div>
  )
}

export default RunSubmitBar