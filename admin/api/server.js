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
const PORT = process.env.PORT || 3002;
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
  // Mock courses data - replace with database queries
  const courses = [
    {
      id: 'course-001',
      title: 'Introduction to Java',
      description: 'Learn Java programming from scratch',
      category: 'Programming',
      difficulty: 'beginner',
      duration: '4 weeks',
      status: 'published',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-15'),
      studentCount: 1250,
      rating: 4.8,
      tags: ['Java', 'Programming', 'Beginner']
    },
    {
      id: 'course-002',
      title: 'Advanced Java Concepts',
      description: 'Deep dive into advanced Java topics',
      category: 'Programming',
      difficulty: 'advanced',
      duration: '6 weeks',
      status: 'published',
      createdAt: new Date('2024-02-01'),
      updatedAt: new Date('2024-02-20'),
      studentCount: 850,
      rating: 4.9,
      tags: ['Java', 'Advanced', 'OOP']
    }
  ];
  
  res.json({ courses });
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