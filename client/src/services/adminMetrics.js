import axios from 'axios'

const BASE = import.meta.env.VITE_API_BASE_URL || ''
const TOKEN = import.meta.env.VITE_ADMIN_TOKEN || ''

function authHeaders() {
  return TOKEN ? { 'X-Admin-Token': TOKEN } : {}
}

export async function getSystemStatus() {
  try {
    const { data } = await axios.get(`${BASE}/api/admin/status`, { headers: authHeaders() })
    return data
  } catch {
    // graceful fallback placeholder
    return { healthy: false, version: undefined, events: [] }
  }
}

export async function getActiveUsers() {
  try {
    const { data } = await axios.get(`${BASE}/api/admin/active-users`, { headers: authHeaders() })
    return data
  } catch {
    return { count: 0, trend: { delta: 0 } }
  }
}

export async function getPerformanceMetrics() {
  try {
    const { data } = await axios.get(`${BASE}/api/admin/performance`, { headers: authHeaders() })
    return data
  } catch {
    return { p95LatencyMs: null, reqPerMin: null, series: [] }
  }
}

export async function getNotifications() {
  try {
    const { data } = await axios.get(`${BASE}/api/admin/notifications`, { headers: authHeaders() })
    return data
  } catch {
    return []
  }
}

export async function listUsers() {
  try {
    const { data } = await axios.get(`${BASE}/api/admin/users`, { headers: authHeaders() })
    return data
  } catch {
    return []
  }
}

export async function updateUserRoles(userId, roles) {
  await axios.put(`${BASE}/api/admin/users/${userId}/roles`, { roles }, { headers: authHeaders() })
}