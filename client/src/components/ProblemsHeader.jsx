import classNames from 'classnames'

const ProblemsHeader = ({ title }) => {
  return (
    <div className="problems-header" role="region" aria-label="Problem header">
      <div className="problems-header__left">
        <h2 className="pane__title" title={title}>{title}</h2>
      </div>
    </div>
  )
}

export default ProblemsHeader