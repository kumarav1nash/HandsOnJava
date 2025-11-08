import React, { useEffect, useState, useCallback } from 'react'
import { listUsers, updateUserRoles } from '../../services/adminMetrics'
import toast from 'react-hot-toast'

export default function Users() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await listUsers()
      setUsers(Array.isArray(data) ? data : [])
    } catch (e) {
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const onRoleChange = async (userId, role) => {
    try {
      await updateUserRoles(userId, [role])
      toast.success('Role updated')
      load()
    } catch (e) {
      toast.error('Failed to update role')
    }
  }

  return (
    <div className="admin-users">
      <header className="admin-section-header">
        <h3>User Management</h3>
        <p className="muted">Assign roles and manage access</p>
      </header>
      <div className="panel">
        <div className="panel__header"><h4>Users</h4></div>
        <div className="panel__content">
          {loading ? (
            <div className="skeleton" aria-busy="true" />
          ) : (
            <table className="table" role="table" aria-label="Users table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Email</th>
                  <th>Role</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td>{u.id}</td>
                    <td>{u.email}</td>
                    <td>
                      <select
                        className="input"
                        aria-label={`Role for ${u.email}`}
                        value={u.role || 'viewer'}
                        onChange={(e) => onRoleChange(u.id, e.target.value)}
                      >
                        <option value="admin">admin</option>
                        <option value="editor">editor</option>
                        <option value="viewer">viewer</option>
                      </select>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr><td colSpan="3" className="muted" style={{ textAlign: 'center' }}>No users</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}