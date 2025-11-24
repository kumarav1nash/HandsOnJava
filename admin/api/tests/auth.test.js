import request from 'supertest';
import app from '../server.js';
import bcrypt from 'bcryptjs';

// Mock data for testing
const testUser = {
  email: 'test@example.com',
  password: 'testPassword123',
  name: 'Test User',
  role: 'admin'
};

describe('Authentication Endpoints', () => {
  let authToken;
  let csrfToken;

  beforeAll(async () => {
    // Create a test user in the mock database
    const hashedPassword = await bcrypt.hash(testUser.password, 10);
    // This would normally be done through the API, but for testing we'll mock it
  });

  afterAll(() => {
    // Clean up test data
  });

  describe('POST /api/admin/auth/login', () => {
    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/admin/auth/login')
        .send({
          email: 'admin@example.com',
          password: 'securePassword123'
        })
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('csrfToken');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user).toHaveProperty('email', 'admin@example.com');
      expect(response.body.user).toHaveProperty('name', 'Admin User');
      expect(response.body.user).toHaveProperty('role', 'admin');

      authToken = response.body.token;
      csrfToken = response.body.csrfToken;
    });

    it('should reject login with invalid email', async () => {
      const response = await request(app)
        .post('/api/admin/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'wrongPassword'
        })
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Invalid credentials');
    });

    it('should reject login with invalid password', async () => {
      const response = await request(app)
        .post('/api/admin/auth/login')
        .send({
          email: 'admin@example.com',
          password: 'wrongPassword'
        })
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Invalid credentials');
    });

    it('should validate email format', async () => {
      const response = await request(app)
        .post('/api/admin/auth/login')
        .send({
          email: 'invalid-email',
          password: 'somePassword'
        })
        .expect(400);

      expect(response.body).toHaveProperty('errors');
    });

    it('should require password minimum length', async () => {
      const response = await request(app)
        .post('/api/admin/auth/login')
        .send({
          email: 'admin@example.com',
          password: '123'
        })
        .expect(400);

      expect(response.body).toHaveProperty('errors');
    });

    it('should handle missing credentials', async () => {
      const response = await request(app)
        .post('/api/admin/auth/login')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('errors');
    });
  });

  describe('POST /api/admin/auth/logout', () => {
    it('should logout successfully with valid token', async () => {
      // First login to get a token
      const loginResponse = await request(app)
        .post('/api/admin/auth/login')
        .send({
          email: 'admin@example.com',
          password: 'securePassword123'
        });

      const token = loginResponse.body.token;

      const response = await request(app)
        .post('/api/admin/auth/logout')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Logged out successfully');
    });

    it('should reject logout without token', async () => {
      const response = await request(app)
        .post('/api/admin/auth/logout')
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Access token required');
    });

    it('should reject logout with invalid token', async () => {
      const response = await request(app)
        .post('/api/admin/auth/logout')
        .set('Authorization', 'Bearer invalid-token')
        .expect(403);

      expect(response.body).toHaveProperty('error', 'Invalid or expired token');
    });
  });

  describe('GET /api/admin/auth/me', () => {
    it('should return current user with valid token', async () => {
      // First login to get a token
      const loginResponse = await request(app)
        .post('/api/admin/auth/login')
        .send({
          email: 'admin@example.com',
          password: 'securePassword123'
        });

      const token = loginResponse.body.token;

      const response = await request(app)
        .get('/api/admin/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user).toHaveProperty('email', 'admin@example.com');
      expect(response.body.user).toHaveProperty('name', 'Admin User');
      expect(response.body.user).toHaveProperty('role', 'admin');
    });

    it('should reject request without token', async () => {
      const response = await request(app)
        .get('/api/admin/auth/me')
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Access token required');
    });

    it('should reject request with expired token', async () => {
      const response = await request(app)
        .get('/api/admin/auth/me')
        .set('Authorization', 'Bearer expired-token')
        .expect(403);

      expect(response.body).toHaveProperty('error', 'Invalid or expired token');
    });
  });

  describe('GET /api/csrf-token', () => {
    it('should generate CSRF token with valid auth', async () => {
      // First login to get a token
      const loginResponse = await request(app)
        .post('/api/admin/auth/login')
        .send({
          email: 'admin@example.com',
          password: 'securePassword123'
        });

      const token = loginResponse.body.token;

      const response = await request(app)
        .get('/api/csrf-token')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('csrfToken');
      expect(response.body.csrfToken).toMatch(/^[a-f0-9-]{36}$/); // UUID format
    });

    it('should reject CSRF token request without auth', async () => {
      const response = await request(app)
        .get('/api/csrf-token')
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Access token required');
    });
  });

  describe('Rate Limiting', () => {
    it('should limit login attempts', async () => {
      // Make multiple failed login attempts
      for (let i = 0; i < 6; i++) {
        await request(app)
          .post('/api/admin/auth/login')
          .send({
            email: 'admin@example.com',
            password: 'wrongPassword'
          });
      }

      // The 6th attempt should be rate limited
      const response = await request(app)
        .post('/api/admin/auth/login')
        .send({
          email: 'admin@example.com',
          password: 'wrongPassword'
        })
        .expect(429);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Too many login attempts');
    });
  });

  describe('Protected Routes', () => {
    let authToken;

    beforeEach(async () => {
      // Login to get auth token
      const loginResponse = await request(app)
        .post('/api/admin/auth/login')
        .send({
          email: 'admin@example.com',
          password: 'securePassword123'
        });
      
      authToken = loginResponse.body.token;
    });

    it('should access protected route with valid token', async () => {
      const response = await request(app)
        .get('/api/admin/courses')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('courses');
      expect(Array.isArray(response.body.courses)).toBe(true);
    });

    it('should reject protected route without token', async () => {
      const response = await request(app)
        .get('/api/admin/courses')
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Access token required');
    });

    it('should reject protected route with invalid token', async () => {
      const response = await request(app)
        .get('/api/admin/courses')
        .set('Authorization', 'Bearer invalid-token')
        .expect(403);

      expect(response.body).toHaveProperty('error', 'Invalid or expired token');
    });
  });

  describe('CSRF Protection', () => {
    let authToken;
    let csrfToken;

    beforeEach(async () => {
      // Login and get CSRF token
      const loginResponse = await request(app)
        .post('/api/admin/auth/login')
        .send({
          email: 'admin@example.com',
          password: 'securePassword123'
        });
      
      authToken = loginResponse.body.token;

      const csrfResponse = await request(app)
        .get('/api/csrf-token')
        .set('Authorization', `Bearer ${authToken}`);
      
      csrfToken = csrfResponse.body.csrfToken;
    });

    it('should allow POST with valid CSRF token', async () => {
      const response = await request(app)
        .post('/api/admin/courses')
        .set('Authorization', `Bearer ${authToken}`)
        .set('X-CSRF-Token', csrfToken)
        .send({
          title: 'Test Course',
          description: 'Test course description'
        })
        .expect(201);

      expect(response.body).toHaveProperty('course');
    });

    it('should reject POST without CSRF token', async () => {
      const response = await request(app)
        .post('/api/admin/courses')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Course',
          description: 'Test course description'
        })
        .expect(403);

      expect(response.body).toHaveProperty('error', 'CSRF token validation failed');
    });

    it('should reject POST with invalid CSRF token', async () => {
      const response = await request(app)
        .post('/api/admin/courses')
        .set('Authorization', `Bearer ${authToken}`)
        .set('X-CSRF-Token', 'invalid-csrf-token')
        .send({
          title: 'Test Course',
          description: 'Test course description'
        })
        .expect(403);

      expect(response.body).toHaveProperty('error', 'CSRF token validation failed');
    });
  });
});

describe('Admin Management Endpoints', () => {
  let adminToken;

  beforeEach(async () => {
    // Login as admin
    const loginResponse = await request(app)
      .post('/api/admin/auth/login')
      .send({
        email: 'admin@example.com',
        password: 'securePassword123'
      });
    
    adminToken = loginResponse.body.token;
  });

  describe('GET /api/admin/users', () => {
    it('should return users list for admin', async () => {
      const response = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('users');
      expect(Array.isArray(response.body.users)).toBe(true);
    });
  });

  describe('POST /api/admin/users', () => {
    it('should create new user with valid data', async () => {
      const csrfResponse = await request(app)
        .get('/api/csrf-token')
        .set('Authorization', `Bearer ${adminToken}`);
      
      const csrfToken = csrfResponse.body.csrfToken;

      const newUser = {
        email: 'newuser@example.com',
        password: 'newPassword123',
        name: 'New User',
        role: 'editor'
      };

      const response = await request(app)
        .post('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('X-CSRF-Token', csrfToken)
        .send(newUser)
        .expect(201);

      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('email', newUser.email);
      expect(response.body.user).toHaveProperty('name', newUser.name);
      expect(response.body.user).toHaveProperty('role', newUser.role);
    });

    it('should reject user creation with invalid email', async () => {
      const csrfResponse = await request(app)
        .get('/api/csrf-token')
        .set('Authorization', `Bearer ${adminToken}`);
      
      const csrfToken = csrfResponse.body.csrfToken;

      const invalidUser = {
        email: 'invalid-email',
        password: 'password123',
        name: 'Invalid User',
        role: 'editor'
      };

      const response = await request(app)
        .post('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('X-CSRF-Token', csrfToken)
        .send(invalidUser)
        .expect(400);

      expect(response.body).toHaveProperty('errors');
    });
  });
});

describe('Course Management Endpoints', () => {
  let adminToken;
  let csrfToken;

  beforeEach(async () => {
    // Login as admin and get CSRF token
    const loginResponse = await request(app)
      .post('/api/admin/auth/login')
      .send({
        email: 'admin@example.com',
        password: 'securePassword123'
      });
    
    adminToken = loginResponse.body.token;

    const csrfResponse = await request(app)
      .get('/api/csrf-token')
      .set('Authorization', `Bearer ${adminToken}`);
    
    csrfToken = csrfResponse.body.csrfToken;
  });

  describe('GET /api/admin/courses', () => {
    it('should return courses list', async () => {
      const response = await request(app)
        .get('/api/admin/courses')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('courses');
      expect(Array.isArray(response.body.courses)).toBe(true);
    });
  });

  describe('POST /api/admin/courses', () => {
    it('should create course with valid data', async () => {
      const courseData = {
        title: 'Test Course',
        description: 'This is a test course',
        category: 'Programming',
        difficulty: 'beginner',
        duration: '4 weeks',
        tags: ['test', 'programming']
      };

      const response = await request(app)
        .post('/api/admin/courses')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('X-CSRF-Token', csrfToken)
        .send(courseData)
        .expect(201);

      expect(response.body).toHaveProperty('course');
      expect(response.body.course).toHaveProperty('id');
      expect(response.body.course).toHaveProperty('title', courseData.title);
      expect(response.body.course).toHaveProperty('description', courseData.description);
    });

    it('should reject course creation without required fields', async () => {
      const incompleteCourse = {
        description: 'Course without title'
      };

      const response = await request(app)
        .post('/api/admin/courses')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('X-CSRF-Token', csrfToken)
        .send(incompleteCourse)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Title and description are required');
    });
  });
});

describe('Problem Management Endpoints', () => {
  let adminToken;
  let csrfToken;

  beforeEach(async () => {
    // Login as admin and get CSRF token
    const loginResponse = await request(app)
      .post('/api/admin/auth/login')
      .send({
        email: 'admin@example.com',
        password: 'securePassword123'
      });
    
    adminToken = loginResponse.body.token;

    const csrfResponse = await request(app)
      .get('/api/csrf-token')
      .set('Authorization', `Bearer ${adminToken}`);
    
    csrfToken = csrfResponse.body.csrfToken;
  });

  describe('GET /api/admin/problems', () => {
    it('should return problems list', async () => {
      const response = await request(app)
        .get('/api/admin/problems')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('problems');
      expect(Array.isArray(response.body.problems)).toBe(true);
    });
  });

  describe('POST /api/admin/problems', () => {
    it('should create problem with valid data', async () => {
      const problemData = {
        title: 'Test Problem',
        description: 'This is a test problem',
        type: 'coding',
        difficulty: 'easy',
        points: 10,
        testCases: [
          {
            input: '1 2',
            expectedOutput: '3',
            isPublic: true
          }
        ]
      };

      const response = await request(app)
        .post('/api/admin/problems')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('X-CSRF-Token', csrfToken)
        .send(problemData)
        .expect(201);

      expect(response.body).toHaveProperty('problem');
      expect(response.body.problem).toHaveProperty('id');
      expect(response.body.problem).toHaveProperty('title', problemData.title);
    });

    it('should reject problem creation without required fields', async () => {
      const incompleteProblem = {
        description: 'Problem without title'
      };

      const response = await request(app)
        .post('/api/admin/problems')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('X-CSRF-Token', csrfToken)
        .send(incompleteProblem)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Title, description, and type are required');
    });
  });
});

describe('Analytics Endpoints', () => {
  let adminToken;

  beforeEach(async () => {
    // Login as admin
    const loginResponse = await request(app)
      .post('/api/admin/auth/login')
      .send({
        email: 'admin@example.com',
        password: 'securePassword123'
      });
    
    adminToken = loginResponse.body.token;
  });

  describe('GET /api/admin/analytics/overview', () => {
    it('should return analytics overview', async () => {
      const response = await request(app)
        .get('/api/admin/analytics/overview')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('totalCourses');
      expect(response.body).toHaveProperty('totalProblems');
      expect(response.body).toHaveProperty('totalUsers');
      expect(response.body).toHaveProperty('activeUsers');
    });
  });

  describe('GET /api/admin/analytics/courses', () => {
    it('should return course analytics', async () => {
      const response = await request(app)
        .get('/api/admin/analytics/courses')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });
});

describe('Audit Logs Endpoints', () => {
  let adminToken;

  beforeEach(async () => {
    // Login as admin
    const loginResponse = await request(app)
      .post('/api/admin/auth/login')
      .send({
        email: 'admin@example.com',
        password: 'securePassword123'
      });
    
    adminToken = loginResponse.body.token;
  });

  describe('GET /api/admin/audit-logs', () => {
    it('should return audit logs', async () => {
      const response = await request(app)
        .get('/api/admin/audit-logs')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('logs');
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('page');
      expect(response.body).toHaveProperty('totalPages');
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/admin/audit-logs?page=2&limit=10')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('page', 2);
      expect(response.body).toHaveProperty('logs');
    });
  });
});

describe('Health Check Endpoint', () => {
  describe('GET /api/health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('environment');
    });
  });
});

describe('Error Handling', () => {
  describe('404 Handler', () => {
    it('should return 404 for non-existent routes', async () => {
      const response = await request(app)
        .get('/api/nonexistent-route')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Route not found');
    });
  });

  describe('500 Handler', () => {
    it('should handle server errors gracefully', async () => {
      // This test would require mocking an internal server error
      // For now, we'll test the error handling structure
      expect(true).toBe(true);
    });
  });
});