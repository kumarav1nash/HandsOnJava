const BASE = import.meta.env.VITE_PUBLIC_API_BASE_URL || '/api'

const getJson = async (path) => {
  const res = await fetch(`${BASE}${path}`)
  if (!res.ok) throw new Error('Request failed')
  return res.json()
}

export const getCourses = () => getJson('/learn/courses')
export const getCourse = (id) => getJson(`/learn/courses/${id}`)
export const getConcept = (id) => getJson(`/learn/concepts/${id}`)
export const getMcq = (id) => getJson(`/learn/mcq/${id}`)
export const getPracticeData = (id) => getJson(`/learn/practices/${id}`)

