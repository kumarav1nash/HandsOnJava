// API Service for Admin Portal
const API_BASE_URL = 'http://localhost:3002/api';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('adminToken');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

// Helper function for API requests
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    ...getAuthHeaders(),
    ...options.headers,
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error(`API Error: ${endpoint}`, error);
    throw error;
  }
};

export const adminApi = {
  // Authentication
  login: (credentials) => apiRequest('/admin/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }),

  logout: () => apiRequest('/admin/logout', {
    method: 'POST',
  }),

  // Courses
  getCourses: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/admin/courses?${queryString}`);
  },

  getCourse: (id) => apiRequest(`/admin/courses/${id}`),

  createCourse: (courseData) => apiRequest('/admin/courses', {
    method: 'POST',
    body: JSON.stringify(courseData),
  }),

  updateCourse: (id, courseData) => apiRequest(`/admin/courses/${id}`, {
    method: 'PUT',
    body: JSON.stringify(courseData),
  }),

  deleteCourse: (id) => apiRequest(`/admin/courses/${id}`, {
    method: 'DELETE',
  }),

  // Problems
  getProblems: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/admin/problems?${queryString}`);
  },

  getProblem: (id) => apiRequest(`/admin/problems/${id}`),

  createProblem: (problemData) => apiRequest('/admin/problems', {
    method: 'POST',
    body: JSON.stringify(problemData),
  }),

  updateProblem: (id, problemData) => apiRequest(`/admin/problems/${id}`, {
    method: 'PUT',
    body: JSON.stringify(problemData),
  }),

  deleteProblem: (id) => apiRequest(`/admin/problems/${id}`, {
    method: 'DELETE',
  }),

  // Analytics
  getAnalytics: (dateRange = '7d') => apiRequest(`/admin/analytics?range=${dateRange}`),

  getAnalyticsSummary: () => apiRequest('/admin/analytics/summary'),

  // Settings
  getSettings: () => apiRequest('/admin/settings'),

  updateSettings: (settings) => apiRequest('/admin/settings', {
    method: 'PUT',
    body: JSON.stringify(settings),
  }),

  // Audit Logs
  getAuditLogs: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/admin/audit-logs?${queryString}`);
  },

  getAuditSummary: (dateRange = '7d') => apiRequest(`/admin/audit-logs/summary?range=${dateRange}`),

  exportAuditLogs: (format, filters = {}) => {
    const queryString = new URLSearchParams({ format, ...filters }).toString();
    return fetch(`${API_BASE_URL}/admin/audit-logs/export?${queryString}`, {
      headers: getAuthHeaders(),
    }).then(response => response.blob());
  },

  // File Upload
  uploadFile: (file, folder = 'uploads') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    return fetch(`${API_BASE_URL}/admin/upload`, {
      method: 'POST',
      headers: {
        'Authorization': getAuthHeaders().Authorization,
      },
      body: formData,
    }).then(response => response.json());
  },

  // Users
  getUsers: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/admin/users?${queryString}`);
  },

  getUser: (id) => apiRequest(`/admin/users/${id}`),

  updateUser: (id, userData) => apiRequest(`/admin/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(userData),
  }),

  deleteUser: (id) => apiRequest(`/admin/users/${id}`, {
    method: 'DELETE',
  }),

  // Health Check
  healthCheck: () => apiRequest('/health'),
};

export default adminApi;