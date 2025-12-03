// API Service for Admin Portal
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api');

// Helper function to get auth headers
const getAuthHeaders = () => {
  let token = localStorage.getItem('adminToken');
  const persisted = localStorage.getItem('admin-auth-storage');
  if (!token && persisted) {
    try {
      const parsed = JSON.parse(persisted);
      token = parsed?.state?.token || token;
    } catch { }
  }
  const csrf = localStorage.getItem('adminCsrfToken');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
    ...(csrf ? { 'X-CSRF-Token': csrf } : {}),
  };
};

// Ensure CSRF token exists (fetch fresh if missing)
export const ensureCsrf = async () => {
  let csrf = null;
  try {
    csrf = localStorage.getItem('adminCsrfToken');
  } catch { }
  if (csrf) return csrf;
  try {
    const res = await fetch(`${API_BASE_URL}/csrf-token`, { credentials: 'same-origin' });
    if (res.ok) {
      const data = await res.json().catch(() => ({}));
      if (data.csrfToken) {
        try { localStorage.setItem('adminCsrfToken', data.csrfToken); } catch { }
        return data.csrfToken;
      }
    }
  } catch { }
  return null;
};

// Helper function for API requests
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  // For mutating requests, try to ensure CSRF is present
  const method = (options.method || 'GET').toUpperCase();
  if (method === 'POST' || method === 'PUT' || method === 'DELETE') {
    await ensureCsrf();
  }
  const headers = {
    ...getAuthHeaders(),
    ...options.headers,
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'same-origin',
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
  login: (credentials) => apiRequest('/admin/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }),

  logout: () => apiRequest('/admin/auth/logout', {
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
  getAnalytics: (dateRange = '7d') => apiRequest(`/admin/analytics/overview`),

  getAnalyticsSummary: () => apiRequest('/admin/analytics/courses'),

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

  getAuditSummary: (dateRange = '24h') => apiRequest(`/admin/audit-summary?timeframe=${dateRange}`),

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
        ...(localStorage.getItem('adminCsrfToken') ? { 'X-CSRF-Token': localStorage.getItem('adminCsrfToken') } : {}),
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

export const adminLearnApi = {
  listCourses: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return apiRequest(`/admin/learn/courses${qs ? `?${qs}` : ''}`);
  },
  getCourse: (id) => apiRequest(`/admin/learn/courses/${id}`),
  createCourse: (course) => apiRequest('/admin/learn/courses', {
    method: 'POST',
    body: JSON.stringify(course),
  }),
  updateCourse: (id, course) => apiRequest(`/admin/learn/courses/${id}`, {
    method: 'PUT',
    body: JSON.stringify(course),
  }),
  createConcept: (concept) => apiRequest('/admin/learn/concepts', {
    method: 'POST',
    body: JSON.stringify(concept),
  }),
  getConcept: (id) => apiRequest(`/admin/learn/concepts/${id}`),
  createMcq: (mcq) => apiRequest('/admin/learn/mcq', {
    method: 'POST',
    body: JSON.stringify(mcq),
  }),
  getMcq: (id) => apiRequest(`/admin/learn/mcq/${id}`),
  createPractice: (practice) => apiRequest('/admin/learn/practices', {
    method: 'POST',
    body: JSON.stringify(practice),
  }),
  getPractice: (id) => apiRequest(`/admin/learn/practices/${id}`),
};
