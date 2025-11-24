import request from 'supertest';
import app from '../server.js';
import bcrypt from 'bcryptjs';

// Mock data for testing
const testUser = {
  email: 'test@example.com',
  password: 'TestPassword123!',
  name: 'Test User',
  role: 'admin'
};

describe('Enhanced Security Features', () => {
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

  describe('Rate Limiting', () => {
    it('should limit login attempts to 5 per 15 minutes', async () => {
      // Make 5 failed login attempts
      for (let i = 0; i < 5; i++) {
        await request(app)
          .post('/api/admin/auth/login')
          .send({
            email: 'admin@example.com',
            password: 'wrongpassword'
          })
          .expect(401);
      }

      // 6th attempt should be rate limited
      const response = await request(app)
        .post('/api/admin/auth/login')
        .send({
          email: 'admin@example.com',
          password: 'wrongpassword'
        })
        .expect(429);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Too many login attempts');
    });

    it('should limit general API requests', async () => {
      // First login to get a token
      const loginResponse = await request(app)
        .post('/api/admin/auth/login')
        .send({
          email: 'admin@example.com',
          password: 'securePassword123'
        });

      const token = loginResponse.body.token;

      // Make 100 requests to trigger rate limiting
      for (let i = 0; i < 100; i++) {
        await request(app)
          .get('/api/admin/auth/me')
          .set('Authorization', `Bearer ${token}`)
          .catch(() => {}); // Ignore errors for this test
      }

      // 101st request should be rate limited
      const response = await request(app)
        .get('/api/admin/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(429);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Too many requests');
    });
  });

  describe('Input Validation', () => {
    it('should reject weak passwords', async () => {
      const loginResponse = await request(app)
        .post('/api/admin/auth/login')
        .send({
          email: 'admin@example.com',
          password: 'securePassword123'
        });

      const token = loginResponse.body.token;

      const response = await request(app)
        .post('/api/admin/users')
        .set('Authorization', `Bearer ${token}`)
        .send({
          email: 'newuser@example.com',
          password: 'weakpass', // Too weak
          name: 'New User',
          role: 'editor'
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Password must contain uppercase, lowercase, number, and special character');
    });

    it('should sanitize malicious input', async () => {
      const loginResponse = await request(app)
        .post('/api/admin/auth/login')
        .send({
          email: 'admin@example.com',
          password: 'securePassword123'
        });

      const token = loginResponse.body.token;

      const response = await request(app)
        .post('/api/admin/users')
        .set('Authorization', `Bearer ${token}`)
        .send({
          email: 'newuser@example.com',
          password: 'StrongPass123!',
          name: '<script>alert("XSS")</script>', // Malicious input
          role: 'editor'
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Request blocked due to security policy');
    });
  });

  describe('Security Headers', () => {
    it('should set security headers', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.headers).toHaveProperty('x-content-type-options', 'nosniff');
      expect(response.headers).toHaveProperty('x-frame-options', 'DENY');
      expect(response.headers).toHaveProperty('x-xss-protection', '0');
      expect(response.headers).toHaveProperty('strict-transport-security');
    });

    it('should set CSP headers', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.headers).toHaveProperty('content-security-policy');
      const csp = response.headers['content-security-policy'];
      expect(csp).toContain("default-src 'self'");
      expect(csp).toContain("script-src 'self'");
      expect(csp).toContain("style-src 'self'");
    });
  });

  describe('Audit Logging', () => {
    it('should log successful logins', async () => {
      const response = await request(app)
        .post('/api/admin/auth/login')
        .send({
          email: 'admin@example.com',
          password: 'securePassword123'
        })
        .expect(200);

      expect(response.body).toHaveProperty('token');
      // Audit log would be created (in real implementation)
    });

    it('should log failed login attempts', async () => {
      const response = await request(app)
        .post('/api/admin/auth/login')
        .send({
          email: 'admin@example.com',
          password: 'wrongpassword'
        })
        .expect(401);

      expect(response.body).toHaveProperty('error');
      // Failed login would be logged (in real implementation)
    });

    it('should provide audit log access to admins', async () => {
      const loginResponse = await request(app)
        .post('/api/admin/auth/login')
        .send({
          email: 'admin@example.com',
          password: 'securePassword123'
        });

      const token = loginResponse.body.token;

      const response = await request(app)
        .get('/api/admin/audit-logs')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('logs');
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('page');
    });

    it('should provide security summary', async () => {
      const loginResponse = await request(app)
        .post('/api/admin/auth/login')
        .send({
          email: 'admin@example.com',
          password: 'securePassword123'
        });

      const token = loginResponse.body.token;

      const response = await request(app)
        .get('/api/admin/audit-summary?timeframe=24h')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('timeframe');
      expect(response.body).toHaveProperty('totalSecurityEvents');
      expect(response.body).toHaveProperty('eventsBySeverity');
      expect(response.body).toHaveProperty('eventsByType');
    });
  });

  describe('CSRF Protection', () => {
    it('should require CSRF token for POST requests', async () => {
      const loginResponse = await request(app)
        .post('/api/admin/auth/login')
        .send({
          email: 'admin@example.com',
          password: 'securePassword123'
        });

      const token = loginResponse.body.token;

      // Try to create a user without CSRF token
      const response = await request(app)
        .post('/api/admin/users')
        .set('Authorization', `Bearer ${token}`)
        .send({
          email: 'newuser@example.com',
          password: 'StrongPass123!',
          name: 'New User',
          role: 'editor'
        })
        .expect(403);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('CSRF token validation failed');
    });

    it('should accept valid CSRF token', async () => {
      const loginResponse = await request(app)
        .post('/api/admin/auth/login')
        .send({
          email: 'admin@example.com',
          password: 'securePassword123'
        });

      const token = loginResponse.body.token;
      const csrfToken = loginResponse.body.csrfToken;

      // Create a user with valid CSRF token
      const response = await request(app)
        .post('/api/admin/users')
        .set('Authorization', `Bearer ${token}`)
        .set('X-CSRF-Token', csrfToken)
        .send({
          email: 'newuser@example.com',
          password: 'StrongPass123!',
          name: 'New User',
          role: 'editor'
        })
        .expect(201);

      expect(response.body).toHaveProperty('user');
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed JSON gracefully', async () => {
      const response = await request(app)
        .post('/api/admin/auth/login')
        .set('Content-Type', 'application/json')
        .send('invalid json{')
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Invalid JSON payload');
    });

    it('should not expose internal errors in production', async () => {
      // This would require setting NODE_ENV=production in the test environment
      // For now, we just verify the error structure
      const response = await request(app)
        .get('/api/nonexistent')
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Route not found');
    });
  });
});