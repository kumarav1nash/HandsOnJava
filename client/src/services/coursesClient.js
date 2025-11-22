import axios from 'axios'

const BASE = import.meta.env.VITE_API_BASE_URL || ''

export async function listCourses() {
  const { data } = await axios.get(`${BASE}/api/courses`)
  return Array.isArray(data) ? data : []
}

export async function getCourse(id) {
  const { data } = await axios.get(`${BASE}/api/courses/${id}`)
  return data
}

