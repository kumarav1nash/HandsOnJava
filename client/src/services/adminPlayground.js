import axios from 'axios'

const BASE = import.meta.env.VITE_API_BASE_URL || ''
const TOKEN = import.meta.env.VITE_ADMIN_TOKEN || ''

function authHeaders() {
  return TOKEN ? { 'X-Admin-Token': TOKEN } : {}
}

export async function generateCandidate({ problemId, prompt }) {
  const { data } = await axios.post(`${BASE}/api/admin/playground/generate`, { problemId, prompt }, { headers: authHeaders() })
  return data
}

export async function executeCandidate({ problemId, code }) {
  const { data } = await axios.post(`${BASE}/api/admin/playground/execute`, { problemId, code, language: 'java' }, { headers: authHeaders() })
  return data
}

export async function generateTestCases({ problemId, code, count = 5 }) {
  const { data } = await axios.post(`${BASE}/api/admin/playground/generate-testcases`, { problemId, code, count }, { headers: authHeaders() })
  return data
}

export async function saveTestCases({ problemId, cases, hidden = true }) {
  const { data } = await axios.post(`${BASE}/api/admin/playground/save-testcases`, { problemId, cases, hidden }, { headers: authHeaders() })
  return data
}