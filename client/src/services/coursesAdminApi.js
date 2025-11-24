// Course Admin API Service
const API_BASE_URL = '/api/admin/courses';

// Helper function to get headers
const getHeaders = () => ({
  'Content-Type': 'application/json',
  'X-Admin-Token': import.meta.env.VITE_ADMIN_TOKEN || 'admin-token'
});

// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'API request failed' }));
    throw new Error(error.message || `HTTP ${response.status}: ${response.statusText}`);
  }
  return response.json();
};

export const coursesAdminApi = {
  // Get all courses with pagination and filtering
  searchCourses: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/search?${queryString}`, {
      headers: getHeaders()
    });
    return handleResponse(response);
  },

  // Get course by ID
  getCourse: async (courseId) => {
    const response = await fetch(`${API_BASE_URL}/${courseId}`, {
      headers: getHeaders()
    });
    return handleResponse(response);
  },

  // Create new course
  createCourse: async (courseData) => {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(courseData)
    });
    return handleResponse(response);
  },

  // Create course draft
  createCourseDraft: async (courseData) => {
    const response = await fetch(`${API_BASE_URL}/draft`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(courseData)
    });
    return handleResponse(response);
  },

  // Update course
  updateCourse: async (courseId, courseData) => {
    const response = await fetch(`${API_BASE_URL}/${courseId}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(courseData)
    });
    return handleResponse(response);
  },

  // Update course draft
  updateCourseDraft: async (courseId, courseData) => {
    const response = await fetch(`${API_BASE_URL}/${courseId}/draft`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(courseData)
    });
    return handleResponse(response);
  },

  // Delete course
  deleteCourse: async (courseId) => {
    const response = await fetch(`${API_BASE_URL}/${courseId}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return handleResponse(response);
  },

  // Publish course
  publishCourse: async (courseId) => {
    const response = await fetch(`${API_BASE_URL}/${courseId}/publish`, {
      method: 'POST',
      headers: getHeaders()
    });
    return handleResponse(response);
  },

  // Unpublish course
  unpublishCourse: async (courseId) => {
    const response = await fetch(`${API_BASE_URL}/${courseId}/unpublish`, {
      method: 'POST',
      headers: getHeaders()
    });
    return handleResponse(response);
  },

  // Archive course
  archiveCourse: async (courseId) => {
    const response = await fetch(`${API_BASE_URL}/${courseId}/archive`, {
      method: 'POST',
      headers: getHeaders()
    });
    return handleResponse(response);
  },

  // Get course preview
  getCoursePreview: async (courseId) => {
    const response = await fetch(`${API_BASE_URL}/${courseId}/preview`, {
      headers: getHeaders()
    });
    return handleResponse(response);
  },

  // Get course versions
  getCourseVersions: async (courseId) => {
    const response = await fetch(`${API_BASE_URL}/${courseId}/versions`, {
      headers: getHeaders()
    });
    return handleResponse(response);
  },

  // Get course statistics
  getCourseStats: async (courseId) => {
    const response = await fetch(`${API_BASE_URL}/${courseId}/stats`, {
      headers: getHeaders()
    });
    return handleResponse(response);
  },

  // Get course content sections
  getCourseSections: async (courseId) => {
    const response = await fetch(`${API_BASE_URL}/${courseId}/sections`, {
      headers: getHeaders()
    });
    return handleResponse(response);
  },

  // Add section to course
  addCourseSection: async (courseId, sectionData) => {
    const response = await fetch(`${API_BASE_URL}/${courseId}/sections`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(sectionData)
    });
    return handleResponse(response);
  },

  // Update course section
  updateCourseSection: async (courseId, sectionId, sectionData) => {
    const response = await fetch(`${API_BASE_URL}/${courseId}/sections/${sectionId}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(sectionData)
    });
    return handleResponse(response);
  },

  // Delete course section
  deleteCourseSection: async (courseId, sectionId) => {
    const response = await fetch(`${API_BASE_URL}/${courseId}/sections/${sectionId}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return handleResponse(response);
  },

  // Reorder course sections
  reorderCourseSections: async (courseId, sectionIds) => {
    const response = await fetch(`${API_BASE_URL}/${courseId}/sections/reorder`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ sectionIds })
    });
    return handleResponse(response);
  },

  // Bulk operations
  bulkDeleteCourses: async (courseIds) => {
    const response = await fetch(`${API_BASE_URL}/bulk/delete`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ courseIds })
    });
    return handleResponse(response);
  },

  bulkPublishCourses: async (courseIds) => {
    const response = await fetch(`${API_BASE_URL}/bulk/publish`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ courseIds })
    });
    return handleResponse(response);
  },

  bulkUnpublishCourses: async (courseIds) => {
    const response = await fetch(`${API_BASE_URL}/bulk/unpublish`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ courseIds })
    });
    return handleResponse(response);
  },

  bulkArchiveCourses: async (courseIds) => {
    const response = await fetch(`${API_BASE_URL}/bulk/archive`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ courseIds })
    });
    return handleResponse(response);
  },

  // Export courses
  exportCourses: async (format = 'json') => {
    const response = await fetch(`${API_BASE_URL}/export?format=${format}`, {
      headers: getHeaders()
    });
    return handleResponse(response);
  },

  // Import courses
  importCourses: async (file, format = 'json') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('format', format);
    
    const response = await fetch(`${API_BASE_URL}/import`, {
      method: 'POST',
      headers: {
        'X-Admin-Token': localStorage.getItem('adminToken') || 'admin-token'
      },
      body: formData
    });
    return handleResponse(response);
  },

  // Add option to question
  addOption: async (questionId, optionData) => {
    const response = await fetch(`/api/admin/questions/${questionId}/options`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(optionData)
    });
    return handleResponse(response);
  },

  // Update option
  updateOption: async (optionId, optionData) => {
    const response = await fetch(`/api/admin/options/${optionId}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(optionData)
    });
    return handleResponse(response);
  },

  // Delete option
  deleteOption: async (optionId) => {
    const response = await fetch(`/api/admin/options/${optionId}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return handleResponse(response);
  },

  // Add question to section
  addQuestion: async (sectionId, questionData) => {
    const response = await fetch(`/api/admin/sections/${sectionId}/questions`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(questionData)
    });
    return handleResponse(response);
  },

  // Update question
  updateQuestion: async (questionId, questionData) => {
    const response = await fetch(`/api/admin/questions/${questionId}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(questionData)
    });
    return handleResponse(response);
  },

  // Delete question
  deleteQuestion: async (questionId) => {
    const response = await fetch(`/api/admin/questions/${questionId}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return handleResponse(response);
  },

  // Set concept for section
  setConcept: async (sectionId, conceptData) => {
    const response = await fetch(`/api/admin/sections/${sectionId}/concept`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(conceptData)
    });
    return handleResponse(response);
  },

  // Set code for section
  setCode: async (sectionId, codeData) => {
    const response = await fetch(`/api/admin/sections/${sectionId}/code`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(codeData)
    });
    return handleResponse(response);
  },

  // List admin courses
  listAdminCourses: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`/api/admin/courses?${queryString}`, {
      headers: getHeaders()
    });
    return handleResponse(response);
  },

  // Upsert course (create or update)
  upsertCourse: async (courseData) => {
    const response = await fetch('/api/admin/courses/upsert', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(courseData)
    });
    return handleResponse(response);
  },

  // Add page to course
  addPage: async (courseId, pageData) => {
    const response = await fetch(`/api/admin/courses/${courseId}/pages`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(pageData)
    });
    return handleResponse(response);
  },

  // Update page
  updatePage: async (pageId, pageData) => {
    const response = await fetch(`/api/admin/pages/${pageId}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(pageData)
    });
    return handleResponse(response);
  },

  // Delete page
  deletePage: async (pageId) => {
    const response = await fetch(`/api/admin/pages/${pageId}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return handleResponse(response);
  },

  // Add section to page
  addSection: async (pageId, sectionData) => {
    const response = await fetch(`/api/admin/pages/${pageId}/sections`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(sectionData)
    });
    return handleResponse(response);
  },

  // Update section
  updateSection: async (sectionId, sectionData) => {
    const response = await fetch(`/api/admin/sections/${sectionId}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(sectionData)
    });
    return handleResponse(response);
  },

  // Delete section
  deleteSection: async (sectionId) => {
    const response = await fetch(`/api/admin/sections/${sectionId}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return handleResponse(response);
  }
};

// Named exports for compatibility
export const listAdminCourses = coursesAdminApi.listAdminCourses;
export const createCourse = coursesAdminApi.createCourse;
export const upsertCourse = coursesAdminApi.upsertCourse;
export const deleteCourse = coursesAdminApi.deleteCourse;
export const addPage = coursesAdminApi.addPage;
export const updatePage = coursesAdminApi.updatePage;
export const deletePage = coursesAdminApi.deletePage;
export const addSection = coursesAdminApi.addSection;
export const updateSection = coursesAdminApi.updateSection;
export const deleteSection = coursesAdminApi.deleteSection;
export const setConcept = coursesAdminApi.setConcept;
export const setCode = coursesAdminApi.setCode;
export const addQuestion = coursesAdminApi.addQuestion;
export const updateQuestion = coursesAdminApi.updateQuestion;
export const deleteQuestion = coursesAdminApi.deleteQuestion;
export const addOption = coursesAdminApi.addOption;
export const updateOption = coursesAdminApi.updateOption;
export const deleteOption = coursesAdminApi.deleteOption;

export default coursesAdminApi;