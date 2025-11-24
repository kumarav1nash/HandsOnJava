export default function StepList({ steps, activeStepId, onSelectStep, completed = {} }) {
  return (
    <ul className="problem-list" role="list">
      {steps.map(s => {
        const active = s.id === activeStepId
        const done = Boolean(completed[s.id])
        return (
          <li key={s.id} className="problem-item">
            <button className={`problem-link ${active ? 'active' : ''}`} onClick={() => onSelectStep(s.id)}>
              <span className="problem-title">{s.description}</span>
              <span className="problem-tags" style={{ marginLeft: '0.5rem' }}>
                {done && <span className="tag-pill" title="Completed">Done</span>}
              </span>
            </button>
            {active && s.hint && (
              <div className="muted" style={{ margin: '0.5rem 0' }}>Hint: {s.hint}</div>
            )}
          </li>
        )
      })}
    </ul>
  )
}