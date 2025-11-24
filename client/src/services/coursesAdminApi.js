import axios from 'axios'

const BASE = import.meta.env.VITE_API_BASE_URL || ''
const TOKEN = import.meta.env.VITE_ADMIN_TOKEN || ''

function authHeaders() { return TOKEN ? { 'X-Admin-Token': TOKEN } : {} }

export async function listAdminCourses() {
  const { data } = await axios.get(`${BASE}/api/admin/courses`, { headers: authHeaders() })
  return Array.isArray(data) ? data : []
}

export async function upsertCourse(course) {
  if (!course?.id) throw new Error('Course id is required')
  const url = `${BASE}/api/admin/courses/${course.id}`
  await axios.put(url, course, { headers: authHeaders() })
}

export async function createCourse(course) {
  await axios.post(`${BASE}/api/admin/courses`, course, { headers: authHeaders() })
}

export async function deleteCourse(id) {
  await axios.delete(`${BASE}/api/admin/courses/${id}`, { headers: authHeaders() })
}

export async function addPage(courseId, page) {
  const { data } = await axios.post(`${BASE}/api/admin/courses/${courseId}/pages`, page, { headers: authHeaders() })
  return data
}

export async function updatePage(pageId, page) {
  await axios.put(`${BASE}/api/admin/pages/${pageId}`, page, { headers: authHeaders() })
}

export async function deletePage(pageId) {
  await axios.delete(`${BASE}/api/admin/pages/${pageId}`, { headers: authHeaders() })
}

export async function addSection(pageId, section) {
  const { data } = await axios.post(`${BASE}/api/admin/pages/${pageId}/sections`, section, { headers: authHeaders() })
  return data
}

export async function updateSection(sectionId, section) {
  await axios.put(`${BASE}/api/admin/sections/${sectionId}`, section, { headers: authHeaders() })
}

export async function deleteSection(sectionId) {
  await axios.delete(`${BASE}/api/admin/sections/${sectionId}`, { headers: authHeaders() })
}

export async function setConcept(sectionId, { content }) {
  await axios.put(`${BASE}/api/admin/sections/${sectionId}/concept`, { sectionId, content }, { headers: authHeaders() })
}

export async function setCode(sectionId, { problemId }) {
  await axios.put(`${BASE}/api/admin/sections/${sectionId}/code`, { sectionId, problemId }, { headers: authHeaders() })
}

export async function addQuestion(sectionId, question) {
  const { data } = await axios.post(`${BASE}/api/admin/sections/${sectionId}/mcq/questions`, question, { headers: authHeaders() })
  return data
}

export async function updateQuestion(questionId, question) {
  await axios.put(`${BASE}/api/admin/mcq/questions/${questionId}`, question, { headers: authHeaders() })
}

export async function deleteQuestion(questionId) {
  await axios.delete(`${BASE}/api/admin/mcq/questions/${questionId}`, { headers: authHeaders() })
}

export async function addOption(questionId, option) {
  const { data } = await axios.post(`${BASE}/api/admin/mcq/questions/${questionId}/options`, option, { headers: authHeaders() })
  return data
}

export async function updateOption(optionId, option) {
  await axios.put(`${BASE}/api/admin/mcq/options/${optionId}`, option, { headers: authHeaders() })
}

export async function deleteOption(optionId) {
  await axios.delete(`${BASE}/api/admin/mcq/options/${optionId}`, { headers: authHeaders() })
}

