import React from 'react'

const AdminGate = ({ children }) => {
  const token = import.meta.env.VITE_ADMIN_TOKEN || ''
  const allowed = Boolean(token)

  if (!allowed) {
    return (
      <div className="pane" aria-label="Admin Access Required">
        <div className="callout callout--warning" role="alert" style={{ marginBottom: 'var(--space-lg)' }}>
          <strong>Admin token not set.</strong> Set <code>VITE_ADMIN_TOKEN</code> in the client environment to enable admin actions.
        </div>
        <p style={{ color: 'var(--color-text-muted)' }}>
          Admin features are disabled. Configure your environment and reload the app.
        </p>
      </div>
    )
  }

  return children
}

export default AdminGate