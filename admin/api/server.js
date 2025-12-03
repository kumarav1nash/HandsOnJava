import express from 'express';
import cors from 'cors';
import session from 'express-session';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Import enhanced security modules
import securityConfig, { validateRequest, securityLogger } from './security.js';
import auditLogger from './audit.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3005;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const SESSION_SECRET = process.env.SESSION_SECRET || 'your-session-secret-change-in-production';

// Enhanced security middleware
app.use(securityConfig.helmet);
app.use(securityLogger);

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com', 'https://admin.yourdomain.com']
    : ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token']
}));

// Enhanced rate limiting
app.use(securityConfig.rateLimits.general);
app.use('/api/admin/auth', securityConfig.rateLimits.auth);
app.use('/api/admin', securityConfig.rateLimits.api);

// Session configuration
app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  },
  name: 'adminSessionId'
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Simple in-memory data stores (replace with database in production)
let users = [
  {
    id: 'admin-001',
    email: 'admin@example.com',
    password: '$2a$10$1t9FgNRzn4cazVBxiUSBVOC6wVaPFm9Ff3Hv3Wmv7uZEvlyAKzCXO', // securePassword123
    role: 'admin',
    name: 'Admin User',
    createdAt: new Date(),
    lastLogin: null,
    isActive: true
  }
];

let auditLogs = [];
let sessions = new Map();
let settings = {
  general: {
    siteName: 'Java Code Editor',
    siteDescription: 'Admin portal',
    timezone: 'UTC',
    maintenanceMode: false
  },
  security: {
    requireStrongPasswords: true,
    enable2FA: false
  },
  notifications: {
    emailEnabled: false
  },
  database: {
    backupEnabled: false
  },
  api: {
    rateLimit: 60
  },
  email: {
    smtpServer: ''
  }
};

// In-memory courses store
let coursesStore = [
  {
    id: 'course-001',
    title: 'Introduction to Java',
    description: 'Learn Java programming from scratch',
    category: 'Programming',
    difficulty: 'BEGINNER',
    duration: '4 weeks',
    status: 'PUBLISHED',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15'),
    studentCount: 1250,
    rating: 4.8,
    tags: ['Java', 'Programming', 'Beginner'],
    instructor: 'John Doe'
  },
  {
    id: 'course-002',
    title: 'Advanced Java Concepts',
    description: 'Deep dive into advanced Java topics',
    category: 'Programming',
    difficulty: 'ADVANCED',
    duration: '6 weeks',
    status: 'PUBLISHED',
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-20'),
    studentCount: 850,
    rating: 4.9,
    tags: ['Java', 'Advanced', 'OOP'],
    instructor: 'Jane Smith'
  },
  {
    id: 'course-003',
    title: 'Spring Boot Fundamentals',
    description: 'Build REST APIs with Spring Boot',
    category: 'Programming',
    difficulty: 'INTERMEDIATE',
    duration: '5 weeks',
    status: 'DRAFT',
    createdAt: new Date('2024-03-10'),
    updatedAt: new Date('2024-03-22'),
    studentCount: 420,
    rating: 4.6,
    tags: ['Java', 'Spring', 'Backend'],
    instructor: 'Mike Johnson'
  }
];

// In-memory Learn content stores
let learnConceptsStore = {};
let learnMcqStore = {};
let learnPracticesStore = {};
let learnCoursesStore = [];

// Utility functions
const generateToken = (userId) => {
  return jwt.sign({ userId, timestamp: Date.now() }, JWT_SECRET, { expiresIn: '24h' });
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

const logAuditEvent = (userId, action, details = {}) => {
  const auditLog = {
    id: uuidv4(),
    userId,
    action,
    details,
    timestamp: new Date(),
    ip: details.ip || 'unknown'
  };
  auditLogs.push(auditLog);
  console.log(`AUDIT: ${userId} - ${action}`, details);
};

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }

  const user = users.find(u => u.id === decoded.userId);
  if (!user || !user.isActive) {
    return res.status(403).json({ error: 'User not found or inactive' });
  }

  req.user = user;
  next();
};

const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// CSRF token middleware
const csrfProtection = (req, res, next) => {
  if (req.method === 'GET') {
    return next();
  }
  
  const csrfToken = req.headers['x-csrf-token'];
  const sessionToken = req.session.csrfToken;
  
  if (!csrfToken || !sessionToken || csrfToken !== sessionToken) {
    return res.status(403).json({ error: 'CSRF token validation failed' });
  }
  
  next();
};

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// CSRF token endpoint
app.get('/api/csrf-token', authenticateToken, (req, res) => {
  const token = uuidv4();
  req.session.csrfToken = token;
  res.json({ csrfToken: token });
});

// Test route to debug
app.post('/api/test/login', (req, res) => {
  console.log('Test login route hit:', req.body);
  res.json({ message: 'Test route working', body: req.body });
});

// Authentication routes
app.post('/api/admin/auth/login', validateRequest(securityConfig.validation.login), async (req, res) => {
  try {
    console.log('Login attempt received:', { email: req.body.email, headers: req.headers });
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    
    const user = users.find(u => u.email === email);
    if (!user) {
      await auditLogger.logAuth(null, 'login_failed', { email, reason: 'user_not_found', ip: req.ip });
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.isActive) {
      await auditLogger.logAuth(user.id, 'login_failed', { reason: 'account_inactive', ip: req.ip });
      return res.status(401).json({ error: 'Account is inactive' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      await auditLogger.logAuth(user.id, 'login_failed', { reason: 'invalid_password', ip: req.ip });
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    user.lastLogin = new Date();
    
    const token = generateToken(user.id);
    sessions.set(token, { userId: user.id, createdAt: new Date() });
    
    // Generate CSRF token
    const csrfToken = uuidv4();
    req.session.csrfToken = csrfToken;
    
    await auditLogger.logAuth(user.id, 'login_success', { ip: req.ip });

    res.json({
      token,
      csrfToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/admin/auth/logout', authenticateToken, async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (token) {
    sessions.delete(token);
  }
  
  await auditLogger.logAuth(req.user.id, 'logout', { ip: req.ip });
  res.json({ message: 'Logged out successfully' });
});

app.get('/api/admin/auth/me', authenticateToken, (req, res) => {
  res.json({
    user: {
      id: req.user.id,
      email: req.user.email,
      name: req.user.name,
      role: req.user.role
    }
  });
});

// Admin management routes
app.get('/api/admin/users', authenticateToken, requireAdmin, (req, res) => {
  const usersData = users.map(user => ({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    createdAt: user.createdAt,
    lastLogin: user.lastLogin,
    isActive: user.isActive
  }));
  
  res.json({ users: usersData });
});

app.post('/api/admin/users', authenticateToken, requireAdmin, validateRequest(securityConfig.validation.createUser), async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, name, role } = req.body;
    
    if (users.find(u => u.email === email)) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: uuidv4(),
      email,
      password: hashedPassword,
      name,
      role,
      createdAt: new Date(),
      lastLogin: null,
      isActive: true
    };

    users.push(newUser);
    await auditLogger.logUser(req.user.id, 'created', newUser.id, { email });

    res.status(201).json({
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        createdAt: newUser.createdAt
      }
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Course management routes
app.get('/api/admin/courses', authenticateToken, requireAdmin, (req, res) => {
  res.json({ courses: coursesStore });
});

// Search with filters and pagination
app.get('/api/admin/courses/search', authenticateToken, requireAdmin, (req, res) => {
  let results = [...coursesStore];

  const {
    query = '',
    status,
    difficultyLevel,
    tags = '',
    category,
    instructor,
    startDate,
    endDate,
    page = 0,
    size = 12,
    sort = 'updatedAt,desc'
  } = req.query;

  if (query) {
    const q = String(query).toLowerCase();
    results = results.filter(c => c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q));
  }
  if (status) results = results.filter(c => c.status === status);
  if (difficultyLevel) results = results.filter(c => c.difficulty === difficultyLevel);
  if (category) results = results.filter(c => c.category === category);
  if (instructor) results = results.filter(c => (c.instructor || '').toLowerCase().includes(String(instructor).toLowerCase()));
  if (tags) {
    const tagList = String(tags).split(',').filter(Boolean);
    if (tagList.length) results = results.filter(c => tagList.every(t => c.tags.includes(t)));
  }
  if (startDate) results = results.filter(c => new Date(c.updatedAt) >= new Date(startDate));
  if (endDate) results = results.filter(c => new Date(c.updatedAt) <= new Date(endDate));

  const [sortBy, sortOrder] = String(sort).split(',');
  results.sort((a, b) => {
    const av = a[sortBy];
    const bv = b[sortBy];
    const cmp = (av > bv) - (av < bv);
    return sortOrder === 'asc' ? cmp : -cmp;
  });

  const total = results.length;
  const start = Number(page) * Number(size);
  const data = results.slice(start, start + Number(size));

  res.json({ data, total, page: Number(page) + 1, totalPages: Math.ceil(total / Number(size)) });
});

app.get('/api/admin/courses/:id', authenticateToken, requireAdmin, (req, res) => {
  const course = coursesStore.find(c => c.id === req.params.id);
  if (!course) return res.status(404).json({ error: 'Course not found' });
  res.json({ course });
});

app.delete('/api/admin/courses/:id', authenticateToken, requireAdmin, (req, res) => {
  const idx = coursesStore.findIndex(c => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Course not found' });
  const removed = coursesStore.splice(idx, 1)[0];
  res.json({ success: true, removedId: removed.id });
});

app.post('/api/admin/courses/:id/publish', authenticateToken, requireAdmin, (req, res) => {
  const course = coursesStore.find(c => c.id === req.params.id);
  if (!course) return res.status(404).json({ error: 'Course not found' });
  course.status = 'PUBLISHED';
  course.updatedAt = new Date();
  res.json({ success: true, course });
});

app.post('/api/admin/courses/:id/unpublish', authenticateToken, requireAdmin, (req, res) => {
  const course = coursesStore.find(c => c.id === req.params.id);
  if (!course) return res.status(404).json({ error: 'Course not found' });
  course.status = 'DRAFT';
  course.updatedAt = new Date();
  res.json({ success: true, course });
});

app.post('/api/admin/courses/:id/archive', authenticateToken, requireAdmin, (req, res) => {
  const course = coursesStore.find(c => c.id === req.params.id);
  if (!course) return res.status(404).json({ error: 'Course not found' });
  course.status = 'ARCHIVED';
  course.updatedAt = new Date();
  res.json({ success: true, course });
});

app.post('/api/admin/courses', authenticateToken, requireAdmin, csrfProtection, (req, res) => {
  const courseData = req.body;
  
  // Validate course data
  if (!courseData.title || !courseData.description) {
    return res.status(400).json({ error: 'Title and description are required' });
  }
  
  const newCourse = {
    id: uuidv4(),
    ...courseData,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: req.user.id
  };
  
  logAuditEvent(req.user.id, 'course_created', { courseId: newCourse.id, title: newCourse.title });
  
  res.status(201).json({ course: newCourse });
});

// Problem management routes
app.get('/api/admin/problems', authenticateToken, requireAdmin, (req, res) => {
  // Mock problems data - replace with database queries
  const problems = [
    {
      id: 'problem-001',
      title: 'Two Sum',
      description: 'Find two numbers in an array that add up to a target sum',
      type: 'coding',
      difficulty: 'easy',
      category: 'Arrays',
      points: 10,
      status: 'published',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-15'),
      testCases: 5,
      submissions: 2500,
      acceptanceRate: 0.65
    },
    {
      id: 'problem-002',
      title: 'Binary Tree Traversal',
      description: 'Implement different tree traversal algorithms',
      type: 'coding',
      difficulty: 'medium',
      category: 'Trees',
      points: 20,
      status: 'published',
      createdAt: new Date('2024-02-01'),
      updatedAt: new Date('2024-02-20'),
      testCases: 8,
      submissions: 1200,
      acceptanceRate: 0.45
    }
  ];
  
  res.json({ problems });
});

app.post('/api/admin/problems', authenticateToken, requireAdmin, csrfProtection, (req, res) => {
  const problemData = req.body;
  
  // Validate problem data
  if (!problemData.title || !problemData.description || !problemData.type) {
    return res.status(400).json({ error: 'Title, description, and type are required' });
  }
  
  const newProblem = {
    id: uuidv4(),
    ...problemData,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: req.user.id
  };
  
  logAuditEvent(req.user.id, 'problem_created', { problemId: newProblem.id, title: newProblem.title });
  
  res.status(201).json({ problem: newProblem });
});

// Categories endpoints
app.get('/api/admin/categories', authenticateToken, requireAdmin, (req, res) => {
  const categories = [
    { id: 'cat-001', name: 'Programming', description: 'Programming courses' },
    { id: 'cat-002', name: 'Data Structures', description: 'Data structures and algorithms' },
    { id: 'cat-003', name: 'Web Development', description: 'Web development courses' },
    { id: 'cat-004', name: 'Database', description: 'Database courses' }
  ];
  
  res.json(categories);
});

app.get('/api/admin/problem-categories', authenticateToken, requireAdmin, (req, res) => {
  const categories = [
    { id: 'prob-cat-001', name: 'Arrays', description: 'Array manipulation problems' },
    { id: 'prob-cat-002', name: 'Strings', description: 'String processing problems' },
    { id: 'prob-cat-003', name: 'Trees', description: 'Tree and graph problems' },
    { id: 'prob-cat-004', name: 'Dynamic Programming', description: 'DP problems' }
  ];
  
  res.json(categories);
});

// Analytics endpoints
app.get('/api/admin/analytics/overview', authenticateToken, requireAdmin, (req, res) => {
  const analytics = {
    totalCourses: 12,
    totalProblems: 45,
    totalUsers: 2847,
    activeUsers: 156,
    courseCompletionRate: 0.68,
    averageRating: 4.7,
    revenue: 12500,
    monthlyGrowth: 0.12
  };
  
  res.json(analytics);
});

// Dashboard stats endpoint
app.get('/api/admin/dashboard/stats', authenticateToken, requireAdmin, (req, res) => {
  const stats = {
    totalCourses: 12,
    publishedCourses: 10,
    totalProblems: 45,
    activeUsers: 156,
    recentActivity: [
      { type: 'course', action: 'created', title: 'Advanced Java Concepts', user: 'John Doe', timestamp: new Date() },
      { type: 'problem', action: 'updated', title: 'Binary Tree Traversal', user: 'Jane Smith', timestamp: new Date() },
      { type: 'course', action: 'published', title: 'React Fundamentals', user: 'Mike Johnson', timestamp: new Date() },
      { type: 'user', action: 'registered', title: 'New user registration', user: 'Sarah Wilson', timestamp: new Date() }
    ]
  };
  res.json(stats);
});

app.get('/api/admin/analytics/courses', authenticateToken, requireAdmin, (req, res) => {
  const courseAnalytics = [
    { month: 'Jan', courses: 8, students: 450 },
    { month: 'Feb', courses: 10, students: 680 },
    { month: 'Mar', courses: 12, students: 920 },
    { month: 'Apr', courses: 15, students: 1150 },
    { month: 'May', courses: 18, students: 1420 },
    { month: 'Jun', courses: 22, students: 1680 }
  ];
  
  res.json(courseAnalytics);
});

app.get('/api/admin/audit-logs', authenticateToken, requireAdmin, (req, res) => {
  const { page = 1, limit = 50 } = req.query;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + parseInt(limit);
  
  const logs = auditLogs
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(startIndex, endIndex);
  
  res.json({
    logs,
    total: auditLogs.length,
    page: parseInt(page),
    totalPages: Math.ceil(auditLogs.length / limit)
  });
});

// File upload endpoint (mock implementation)
app.post('/api/admin/upload', authenticateToken, requireAdmin, async (req, res) => {
  // This is a mock implementation - in production, integrate with cloud storage
  const { filename, content, type } = req.body;
  
  if (!filename || !content) {
    return res.status(400).json({ error: 'Filename and content are required' });
  }
  
  // Simulate file upload
  const fileId = uuidv4();
  const fileUrl = `/uploads/${fileId}/${filename}`;
  
  await auditLogger.log(req.user.id, 'file_uploaded', { fileId, filename, type });
  
  res.json({
    fileId,
    filename,
    url: fileUrl,
    size: content.length
  });
});

app.get('/api/admin/audit-logs/export', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { format = 'json' } = req.query;
    const result = auditLogger.getLogs(req.query);
    if (format === 'csv') {
      const rows = result.logs.map(l => [l.id, l.timestamp, l.userId, l.action, l.severity, (l.details?.ip || 'unknown')]);
      const csv = ['id,timestamp,userId,action,severity,ip'].concat(rows.map(r => r.map(v => String(v).replace(/"/g, '""')).join(','))).join('\n');
      res.setHeader('Content-Type', 'text/csv');
      res.send(csv);
    } else {
      res.json(result.logs);
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to export audit logs' });
  }
});

app.get('/api/admin/settings', authenticateToken, requireAdmin, (req, res) => {
  res.json(settings);
});

app.put('/api/admin/settings', authenticateToken, requireAdmin, (req, res) => {
  const incoming = req.body;
  settings = { ...settings, ...incoming };
  res.json(settings);
});

// Audit logging endpoints
app.get('/api/admin/audit-logs', authenticateToken, requireAdmin, (req, res) => {
  try {
    const filters = {
      userId: req.query.userId,
      action: req.query.action,
      severity: req.query.severity,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 50
    };

    const result = auditLogger.getLogs(filters);
    res.json(result);
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

app.get('/api/admin/audit-summary', authenticateToken, requireAdmin, (req, res) => {
  try {
    const timeframe = req.query.timeframe || '24h';
    const summary = auditLogger.getSecuritySummary(timeframe);
    res.json(summary);
  } catch (error) {
    console.error('Error fetching audit summary:', error);
    res.status(500).json({ error: 'Failed to fetch audit summary' });
  }
});

app.post('/api/admin/audit-export', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { filePath, filters } = req.body;
    
    if (!filePath) {
      return res.status(400).json({ error: 'File path is required' });
    }

    const result = await auditLogger.exportLogs(filePath, filters);
    
    if (result.success) {
      await auditLogger.log(req.user.id, 'audit_exported', { filePath, count: result.count });
      res.json({ message: 'Audit logs exported successfully', count: result.count });
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error exporting audit logs:', error);
    res.status(500).json({ error: 'Failed to export audit logs' });
  }
});

// Learn content admin routes
app.get('/api/admin/learn/courses', authenticateToken, requireAdmin, (req, res) => {
  res.json({ data: learnCoursesStore });
});

app.get('/api/admin/learn/courses/:id', authenticateToken, requireAdmin, (req, res) => {
  const course = learnCoursesStore.find(c => c.id === req.params.id);
  if (!course) return res.status(404).json({ error: 'Course not found' });
  res.json({ data: course });
});

app.post('/api/admin/learn/courses', authenticateToken, requireAdmin, csrfProtection, (req, res) => {
  const { title, summary = '', level = 'Beginner', tags = [], modules = [], status = 'DRAFT' } = req.body || {};
  if (!title || !Array.isArray(modules)) return res.status(400).json({ error: 'Title and modules are required' });
  const id = uuidv4();
  const course = { id, title, summary, level, tags, modules, status, createdAt: new Date(), updatedAt: new Date() };
  learnCoursesStore.push(course);
  res.status(201).json({ id, data: course });
});

app.put('/api/admin/learn/courses/:id', authenticateToken, requireAdmin, csrfProtection, (req, res) => {
  const idx = learnCoursesStore.findIndex(c => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Course not found' });
  const incoming = req.body || {};
  learnCoursesStore[idx] = { ...learnCoursesStore[idx], ...incoming, updatedAt: new Date() };
  res.json({ data: learnCoursesStore[idx] });
});

app.post('/api/admin/learn/concepts', authenticateToken, requireAdmin, csrfProtection, (req, res) => {
  const { title, summary = '', overview = '', tags = [], difficulty = 'Beginner', starterCode = '', steps = [] } = req.body || {};
  if (!title) return res.status(400).json({ error: 'Title is required' });
  const id = uuidv4();
  const concept = { id, title, summary, overview, tags, difficulty, starterCode, steps };
  learnConceptsStore[id] = concept;
  res.status(201).json({ id, data: concept });
});

app.get('/api/admin/learn/concepts/:id', authenticateToken, requireAdmin, (req, res) => {
  const concept = learnConceptsStore[req.params.id];
  if (!concept) return res.status(404).json({ error: 'Concept not found' });
  res.json({ data: concept });
});

app.post('/api/admin/learn/mcq', authenticateToken, requireAdmin, csrfProtection, (req, res) => {
  const { title, questions = [] } = req.body || {};
  if (!title || !Array.isArray(questions) || questions.length === 0) return res.status(400).json({ error: 'Title and questions are required' });
  const id = uuidv4();
  const mcq = { id, title, questions };
  learnMcqStore[id] = mcq;
  res.status(201).json({ id, data: mcq });
});

app.get('/api/admin/learn/mcq/:id', authenticateToken, requireAdmin, (req, res) => {
  const mcq = learnMcqStore[req.params.id];
  if (!mcq) return res.status(404).json({ error: 'MCQ not found' });
  res.json({ data: mcq });
});

app.post('/api/admin/learn/practices', authenticateToken, requireAdmin, csrfProtection, (req, res) => {
  const { title, goal = '', starterCode = '', stdin = '', expectedStdout = '', hint = '' } = req.body || {};
  if (!title || !goal) return res.status(400).json({ error: 'Title and goal are required' });
  const id = uuidv4();
  const practice = { id, title, goal, starterCode, stdin, expectedStdout, hint };
  learnPracticesStore[id] = practice;
  res.status(201).json({ id, data: practice });
});

app.get('/api/admin/learn/practices/:id', authenticateToken, requireAdmin, (req, res) => {
  const practice = learnPracticesStore[req.params.id];
  if (!practice) return res.status(404).json({ error: 'Practice not found' });
  res.json({ data: practice });
});

// Public Learn endpoints
app.get('/api/learn/courses', (req, res) => {
  res.json({ data: learnCoursesStore });
});

app.get('/api/learn/courses/:id', (req, res) => {
  const course = learnCoursesStore.find(c => c.id === req.params.id);
  if (!course) return res.status(404).json({ error: 'Course not found' });
  res.json({ data: course });
});

app.get('/api/learn/concepts/:id', (req, res) => {
  const concept = learnConceptsStore[req.params.id];
  if (!concept) return res.status(404).json({ error: 'Concept not found' });
  res.json({ data: concept });
});

app.get('/api/learn/mcq/:id', (req, res) => {
  const mcq = learnMcqStore[req.params.id];
  if (!mcq) return res.status(404).json({ error: 'MCQ not found' });
  res.json({ data: mcq });
});

app.get('/api/learn/practices/:id', (req, res) => {
  const practice = learnPracticesStore[req.params.id];
  if (!practice) return res.status(404).json({ error: 'Practice not found' });
  res.json({ data: practice });
});

// Error handling middleware
app.use(async (error, req, res, next) => {
  console.error('Error:', error);
  
  // Log error to audit system
  await auditLogger.logError(
    req.user?.id || 'anonymous',
    'server_error',
    error,
    {
      url: req.url,
      method: req.method,
      ip: req.ip
    }
  );
  
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON payload' });
  }
  
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`Admin API server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Default admin credentials: admin@example.com / securePassword123`);
});

export default app;
