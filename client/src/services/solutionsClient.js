import axios from 'axios'

const BASE = import.meta.env.VITE_API_BASE_URL || ''

export async function runSolution({ problemId, code }) {
  const { data } = await axios.post(`${BASE}/api/solutions/run`, { problemId, code, language: 'java' })
  return data
}

export async function submitSolution({ problemId, code }) {
  const { data } = await axios.post(`${BASE}/api/solutions/submit`, { problemId, code })
  return data
}