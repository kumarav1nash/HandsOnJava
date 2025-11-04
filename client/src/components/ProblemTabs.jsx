import { useId } from 'react'

const TAB_KEYS = ['Description', 'Editorial', 'Submissions']

const ProblemTabs = ({ active, onChange }) => {
  const id = useId()
  return (
    <div className="tabs" role="tablist" aria-label="Problem sections">
      {TAB_KEYS.map((k) => {
        const selected = active === k
        const controlId = `${id}-${k}-panel`
        return (
          <button
            key={k}
            role="tab"
            className={`tab ${selected ? 'active' : ''}`}
            aria-selected={selected}
            aria-controls={controlId}
            onClick={() => onChange?.(k)}
            title={k}
          >
            {k}
          </button>
        )
      })}
    </div>
  )
}

export default ProblemTabs