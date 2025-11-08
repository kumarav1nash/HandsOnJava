import React from 'react'

export default function Settings() {
  return (
    <div className="admin-settings">
      <header className="admin-section-header">
        <h3>Audit & Settings</h3>
        <p className="muted">Configure admin preferences and view audit logs</p>
      </header>
      <div className="panel-grid">
        <section className="panel" aria-label="Preferences">
          <div className="panel__header"><h4>Preferences</h4></div>
          <div className="panel__content">
            <label className="label">Email alerts
              <input type="checkbox" className="input" defaultChecked />
            </label>
            <label className="label">Dark mode charts
              <input type="checkbox" className="input" defaultChecked />
            </label>
          </div>
        </section>
        <section className="panel" aria-label="Audit logs">
          <div className="panel__header"><h4>Audit logs</h4></div>
          <div className="panel__content">
            <p className="muted">Audit log integration pending backend. Define endpoint and retention policy.</p>
          </div>
        </section>
      </div>
    </div>
  )
}