import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { body, validationResult } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';

// Enhanced security configuration
export const securityConfig = {
  // Rate limiting configurations
  rateLimits: {
    general: rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
      message: 'Too many requests from this IP, please try again later.',
      standardHeaders: true,
      legacyHeaders: false,
      handler: (req, res) => {
        console.warn(`Rate limit exceeded for IP: ${req.ip}`);
        res.status(429).json({
          error: 'Too many requests from this IP, please try again later.',
          retryAfter: Math.round(securityConfig.rateLimits.general.windowMs / 1000)
        });
      }
    }),
    
    auth: rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 5, // limit each IP to 5 login attempts per windowMs
      message: 'Too many login attempts, please try again later.',
      skipSuccessfulRequests: true,
      handler: (req, res) => {
        console.warn(`Auth rate limit exceeded for IP: ${req.ip}`);
        res.status(429).json({
          error: 'Too many login attempts, please try again later.',
          retryAfter: Math.round(securityConfig.rateLimits.auth.windowMs / 1000)
        });
      }
    }),
    
    api: rateLimit({
      windowMs: 1 * 60 * 1000, // 1 minute
      max: 60, // limit each IP to 60 API requests per minute
      message: 'Too many API requests, please try again later.',
      standardHeaders: true,
      legacyHeaders: false,
      handler: (req, res) => {
        console.warn(`API rate limit exceeded for IP: ${req.ip}`);
        res.status(429).json({
          error: 'Too many API requests, please try again later.',
          retryAfter: Math.round(securityConfig.rateLimits.api.windowMs / 1000)
        });
      }
    })
  },

  // Helmet configuration for enhanced security headers
  helmet: helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"],
        scriptSrc: [
          "'self'", 
          "'unsafe-inline'", 
          "https://cdn.tiny.cloud", // TinyMCE
          "https://cdnjs.cloudflare.com" // Monaco Editor
        ],
        imgSrc: ["'self'", "data:", "https:", "blob:"],
        connectSrc: ["'self'", "https://cdn.tiny.cloud"],
        fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'", "blob:"],
        frameSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        frameAncestors: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
    crossOriginEmbedderPolicy: false, // Required for TinyMCE
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true
    },
    noSniff: true,
    xssFilter: true,
    referrerPolicy: { policy: 'same-origin' }
  }),

  // Input validation schemas
  validation: {
    login: [
      body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
      body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    ],
    
    createUser: [
      body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
      body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage('Password must contain uppercase, lowercase, number, and special character'),
      body('name').trim().isLength({ min: 1, max: 100 }).withMessage('Name is required and must be less than 100 characters'),
      body('role').isIn(['admin', 'editor', 'viewer']).withMessage('Invalid role specified')
    ],
    
    createCourse: [
      body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Title is required and must be less than 200 characters'),
      body('description').trim().isLength({ min: 10, max: 2000 }).withMessage('Description must be between 10 and 2000 characters'),
      body('category').trim().isLength({ min: 1, max: 100 }).withMessage('Category is required and must be less than 100 characters'),
      body('difficulty').isIn(['beginner', 'intermediate', 'advanced']).withMessage('Invalid difficulty level'),
      body('duration').optional().isLength({ max: 50 }).withMessage('Duration must be less than 50 characters')
    ],
    
    createProblem: [
      body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Title is required and must be less than 200 characters'),
      body('description').trim().isLength({ min: 10, max: 5000 }).withMessage('Description must be between 10 and 5000 characters'),
      body('type').isIn(['multiple-choice', 'true-false', 'coding', 'fill-blank', 'essay']).withMessage('Invalid problem type'),
      body('difficulty').isIn(['easy', 'medium', 'hard']).withMessage('Invalid difficulty level'),
      body('points').optional().isInt({ min: 1, max: 1000 }).withMessage('Points must be between 1 and 1000')
    ]
  },

  // Security utilities
  utils: {
    // Generate secure random token
    generateSecureToken: () => {
      return uuidv4() + '-' + Date.now() + '-' + Math.random().toString(36).substring(2, 15);
    },

    // Sanitize input data
    sanitizeInput: (data) => {
      if (typeof data === 'string') {
        return data.trim().replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
      }
      if (typeof data === 'object' && data !== null) {
        const sanitized = {};
        for (const key in data) {
          sanitized[key] = securityConfig.utils.sanitizeInput(data[key]);
        }
        return sanitized;
      }
      return data;
    },

    // Validate file upload
    validateFileUpload: (file) => {
      const allowedTypes = [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'application/pdf', 'text/plain', 'text/csv',
        'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ];
      
      const maxSize = 10 * 1024 * 1024; // 10MB
      
      if (!allowedTypes.includes(file.mimetype)) {
        return { valid: false, error: 'File type not allowed' };
      }
      
      if (file.size > maxSize) {
        return { valid: false, error: 'File size exceeds 10MB limit' };
      }
      
      return { valid: true };
    },

    // Check for suspicious activity patterns
    detectSuspiciousActivity: (req) => {
      const suspiciousPatterns = [
        /union.*select/i,           // SQL injection
        /<script.*>/i,              // XSS attempts
        /javascript:/i,            // JavaScript injection
        /onload=/i,                // Event handler injection
        /\.\.\//g,                  // Directory traversal
        /etc\/passwd/i,             // Unix file access
        /windows\/system32/i,       // Windows file access
        /select.*from.*where/i,    // SQL injection
        /drop.*table/i,             // SQL injection
        /exec\s*\(/i,               // Command execution
        /xp_cmdshell/i             // SQL Server command execution
      ];

      const checkString = (str) => {
        if (typeof str !== 'string') return false;
        return suspiciousPatterns.some(pattern => pattern.test(str));
      };

      // Check URL, query parameters, body, and headers
      const allData = [
        req.url,
        JSON.stringify(req.query),
        JSON.stringify(req.body),
        JSON.stringify(req.headers)
      ].join(' ');

      return checkString(allData);
    }
  }
};

// Middleware to validate request input
export const validateRequest = (validationRules) => {
  return async (req, res, next) => {
    // Run validation rules
    await Promise.all(validationRules.map(validation => validation.run(req)));
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }
    
    // Check for suspicious activity
    if (securityConfig.utils.detectSuspiciousActivity(req)) {
      console.warn(`Suspicious activity detected from IP: ${req.ip}`, {
        url: req.url,
        method: req.method,
        userAgent: req.get('User-Agent')
      });
      
      return res.status(400).json({ 
        error: 'Request blocked due to security policy' 
      });
    }
    
    // Sanitize input data
    req.body = securityConfig.utils.sanitizeInput(req.body);
    
    next();
  };
};

// Middleware to log security events
export const securityLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: duration,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      referer: req.get('Referer'),
      userId: req.user?.id || 'anonymous'
    };
    
    // Log security-relevant events
    if (res.statusCode >= 400) {
      console.warn('Security event:', logData);
    }
    
    // Log slow requests (potential DoS)
    if (duration > 5000) {
      console.warn('Slow request detected:', logData);
    }
  });
  
  next();
};

export default securityConfig;