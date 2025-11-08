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

// Paginated problems list, optional tag filtering (mode: 'any' | 'all')
export async function listProblemsPaged({ page = 0, size = 20, tags = [], mode = 'any' } = {}) {
  const params = new URLSearchParams()
  params.set('page', String(page))
  params.set('size', String(size))
  if (tags && tags.length) params.set('tags', tags.join(','))
  if (mode) params.set('mode', mode)
  const { data } = await axios.get(`${API_BASE}/page?${params.toString()}`)
  return data
}

// Unique tags across all problems
export async function listTags() {
  const { data } = await axios.get(`${API_BASE}/tags`)
  return Array.isArray(data) ? data : []
}