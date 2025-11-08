import classNames from 'classnames'

const ResultsPanel = ({ response }) => {
  const isSubmit = response && typeof response.accepted === 'boolean'
  const allPassed = response ? (isSubmit ? response.accepted : response.allPassed) : null
  const results = response?.results || []
  const summary = response
    ? (isSubmit ? (response.message || (allPassed ? 'Accepted' : 'Rejected')) : (allPassed ? 'All tests passed' : 'Some tests failed'))
    : null

  return (
    <div className="results" role="region" aria-label="Test results">
      {!response ? (
        <div className="results__empty" role="status" aria-live="polite">You must run your code first</div>
      ) : (
        <>
          <div className={classNames('results__banner', { success: allPassed, error: !allPassed })} role="status" aria-live="polite">
            {summary}
          </div>
          <div className="outputs">
            {results.map((r, i) => (
              <div key={i} className="output">
                <div className="output__title">Test #{i + 1} — {r.passed ? 'Pass' : 'Fail'}</div>
                <pre className={classNames('output__content', { success: r.passed, error: !r.passed })}>
{(() => {
  const hasStdout = r?.actualOutput && String(r.actualOutput).trim()
  const hasStderr = r?.stderr && String(r.stderr).trim()
  const label = r.exitCode === 0 ? 'Actual' : (hasStderr ? 'Error' : 'Actual')
  const content = hasStdout ? r.actualOutput : (hasStderr ? r.stderr : '')
  return `Input:\n${r.input}\nExpected:\n${r.expectedOutput}\n${label}:\n${content}\nExit: ${r.exitCode} • ${r.durationMs} ms`
})()}
                </pre>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default ResultsPanel