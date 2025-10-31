import classNames from 'classnames'

const ProblemsHeader = ({ title, onRun, onSubmit, running, problems = [], selectedId, onSelect }) => {
  return (
    <div className="problems-header" role="region" aria-label="Problem header">
      <div className="problems-header__left">
        <h2 className="pane__title" title={title}>{title}</h2>
        {Array.isArray(problems) && problems.length > 0 && (
          <select 
            className="btn btn--ghost problems-header__select"
            aria-label="Select problem"
            value={selectedId || ''}
            onChange={(e) => onSelect?.(e.target.value)}
            title="Select problem"
          >
            {problems.map((p) => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </select>
        )}
      </div>
      <div className="problems-header__actions">
        <button 
          className={classNames('btn', 'btn--primary', { loading: running })}
          onClick={onRun}
          disabled={running}
          aria-label={running ? 'Running sample tests' : 'Run sample tests'}
          title="Run sample tests (Ctrl/Cmd+Enter)"
        >
          {running ? 'Running…' : 'Run'}
        </button>
        <button className="btn btn--success" onClick={onSubmit} title="Submit solution">Submit</button>
      </div>
    </div>
  )
}

export default ProblemsHeader