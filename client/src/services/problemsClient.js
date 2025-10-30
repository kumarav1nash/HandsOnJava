import axios from 'axios'

const BASE = import.meta.env.VITE_API_BASE_URL || ''
const API_BASE = `${BASE}/api/problems`

export async function listProblems() {
  const { data } = await axios.get(API_BASE)
  return Array.isArray(data) ? data : []
}

export async function getProblem(id) {
  const { data } = await axios.get(`${API_BASE}/${id}`)
  return data
}