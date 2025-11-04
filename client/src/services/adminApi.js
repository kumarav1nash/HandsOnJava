import axios from 'axios'

const BASE = import.meta.env.VITE_API_BASE_URL || ''
const TOKEN = import.meta.env.VITE_ADMIN_TOKEN || ''

function authHeaders() {
  return TOKEN ? { 'X-Admin-Token': TOKEN } : {}
}

export async function createProblem(problem) {
  await axios.post(`${BASE}/api/admin/problems`, problem, { headers: authHeaders() })
}

export async function updateProblem(id, problem) {
  await axios.put(`${BASE}/api/admin/problems/${id}`, problem, { headers: authHeaders() })
}

export async function deleteProblem(id) {
  await axios.delete(`${BASE}/api/admin/problems/${id}`, { headers: authHeaders() })
}

export async function listTestCases(problemId) {
  const { data } = await axios.get(`${BASE}/api/admin/problems/${problemId}/testcases`, { headers: authHeaders() })
  return Array.isArray(data) ? data : []
}

export async function addTestCase(problemId, { input, expectedOutput, sample = true }) {
  await axios.post(`${BASE}/api/admin/problems/${problemId}/testcases`, { input, expectedOutput, sample }, { headers: authHeaders() })
}

export async function deleteAllTestCases(problemId) {
  await axios.delete(`${BASE}/api/admin/problems/${problemId}/testcases`, { headers: authHeaders() })
}