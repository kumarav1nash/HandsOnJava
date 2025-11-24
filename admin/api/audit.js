import { v4 as uuidv4 } from 'uuid';
import fs from 'fs/promises';
import path from 'path';

// Enhanced audit logging system
class AuditLogger {
  constructor() {
    this.logs = [];
    this.maxLogsInMemory = 1000;
    this.logFilePath = process.env.AUDIT_LOG_PATH || './logs/audit.log';
    this.enableFileLogging = process.env.NODE_ENV === 'production';
    
    // Create logs directory if it doesn't exist
    if (this.enableFileLogging) {
      this.ensureLogDirectory();
    }
  }

  async ensureLogDirectory() {
    try {
      const logDir = path.dirname(this.logFilePath);
      await fs.mkdir(logDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create log directory:', error);
    }
  }

  /**
   * Log an audit event
   * @param {string} userId - User ID who performed the action
   * @param {string} action - Action performed
   * @param {object} details - Additional details about the action
   * @param {string} severity - Severity level (info, warning, error, critical)
   */
  async log(userId, action, details = {}, severity = 'info') {
    const auditLog = {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      userId: userId || 'system',
      action,
      severity,
      details: {
        ...details,
        ip: details.ip || 'unknown',
        userAgent: details.userAgent || 'unknown',
        referer: details.referer || 'unknown',
        sessionId: details.sessionId || 'unknown'
      }
    };

    // Add to memory logs
    this.logs.push(auditLog);
    
    // Keep only recent logs in memory
    if (this.logs.length > this.maxLogsInMemory) {
      this.logs = this.logs.slice(-this.maxLogsInMemory);
    }

    // Log to console
    this.logToConsole(auditLog);

    // Log to file in production
    if (this.enableFileLogging) {
      await this.logToFile(auditLog);
    }

    return auditLog;
  }

  /**
   * Log authentication events
   */
  async logAuth(userId, action, details = {}) {
    return this.log(userId, `auth_${action}`, details, 'info');
  }

  /**
   * Log security events
   */
  async logSecurity(userId, action, details = {}) {
    return this.log(userId, `security_${action}`, details, 'warning');
  }

  /**
   * Log course management events
   */
  async logCourse(userId, action, courseId, details = {}) {
    return this.log(userId, `course_${action}`, { 
      courseId, 
      ...details 
    }, 'info');
  }

  /**
   * Log problem management events
   */
  async logProblem(userId, action, problemId, details = {}) {
    return this.log(userId, `problem_${action}`, { 
      problemId, 
      ...details 
    }, 'info');
  }

  /**
   * Log user management events
   */
  async logUser(userId, action, targetUserId, details = {}) {
    return this.log(userId, `user_${action}`, { 
      targetUserId, 
      ...details 
    }, 'info');
  }

  /**
   * Log system events
   */
  async logSystem(action, details = {}) {
    return this.log('system', action, details, 'info');
  }

  /**
   * Log error events
   */
  async logError(userId, action, error, details = {}) {
    return this.log(userId, action, { 
      error: error.message || error,
      stack: error.stack,
      ...details 
    }, 'error');
  }

  /**
   * Get audit logs with filtering
   */
  getLogs(filters = {}) {
    let filteredLogs = [...this.logs];

    // Filter by user ID
    if (filters.userId) {
      filteredLogs = filteredLogs.filter(log => log.userId === filters.userId);
    }

    // Filter by action
    if (filters.action) {
      filteredLogs = filteredLogs.filter(log => log.action.includes(filters.action));
    }

    // Filter by severity
    if (filters.severity) {
      filteredLogs = filteredLogs.filter(log => log.severity === filters.severity);
    }

    // Filter by date range
    if (filters.startDate) {
      const startDate = new Date(filters.startDate);
      filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) >= startDate);
    }

    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) <= endDate);
    }

    // Sort by timestamp (newest first)
    filteredLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Apply pagination
    const page = filters.page || 1;
    const limit = filters.limit || 50;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    return {
      logs: filteredLogs.slice(startIndex, endIndex),
      total: filteredLogs.length,
      page,
      totalPages: Math.ceil(filteredLogs.length / limit)
    };
  }

  /**
   * Get security summary
   */
  getSecuritySummary(timeframe = '24h') {
    const now = new Date();
    const startTime = new Date(now.getTime() - this.parseTimeframe(timeframe));
    
    const recentLogs = this.logs.filter(log => 
      new Date(log.timestamp) >= startTime && 
      ['warning', 'error', 'critical'].includes(log.severity)
    );

    const summary = {
      timeframe,
      startTime: startTime.toISOString(),
      endTime: now.toISOString(),
      totalSecurityEvents: recentLogs.length,
      eventsBySeverity: {},
      eventsByType: {},
      topUsers: {},
      suspiciousActivities: []
    };

    recentLogs.forEach(log => {
      // Count by severity
      summary.eventsBySeverity[log.severity] = 
        (summary.eventsBySeverity[log.severity] || 0) + 1;

      // Count by type
      const eventType = log.action.split('_')[0];
      summary.eventsByType[eventType] = 
        (summary.eventsByType[eventType] || 0) + 1;

      // Count by user
      summary.topUsers[log.userId] = 
        (summary.topUsers[log.userId] || 0) + 1;

      // Identify suspicious activities
      if (log.action.includes('suspicious') || log.action.includes('attack')) {
        summary.suspiciousActivities.push(log);
      }
    });

    return summary;
  }

  /**
   * Parse timeframe string (e.g., '24h', '7d', '1w')
   */
  parseTimeframe(timeframe) {
    const match = timeframe.match(/^(\d+)([hdwm])$/);
    if (!match) return 24 * 60 * 60 * 1000; // Default to 24 hours

    const value = parseInt(match[1]);
    const unit = match[2];

    const multipliers = {
      'h': 60 * 60 * 1000,        // hours
      'd': 24 * 60 * 60 * 1000,   // days
      'w': 7 * 24 * 60 * 60 * 1000, // weeks
      'm': 30 * 24 * 60 * 60 * 1000 // months (approximate)
    };

    return value * multipliers[unit];
  }

  /**
   * Log to console with appropriate formatting
   */
  logToConsole(auditLog) {
    const timestamp = new Date(auditLog.timestamp).toLocaleString();
    const severityColors = {
      info: '\x1b[36m',    // Cyan
      warning: '\x1b[33m', // Yellow
      error: '\x1b[31m',   // Red
      critical: '\x1b[35m' // Magenta
    };

    const color = severityColors[auditLog.severity] || '\x1b[0m';
    const reset = '\x1b[0m';

    console.log(
      `${color}[AUDIT] ${timestamp} [${auditLog.severity.toUpperCase()}] ` +
      `User: ${auditLog.userId} | Action: ${auditLog.action} | ` +
      `IP: ${auditLog.details.ip}${reset}`
    );

    if (auditLog.details.error) {
      console.log(`${color}  Error: ${auditLog.details.error}${reset}`);
    }
  }

  /**
   * Log to file
   */
  async logToFile(auditLog) {
    try {
      const logLine = JSON.stringify(auditLog) + '\n';
      await fs.appendFile(this.logFilePath, logLine);
    } catch (error) {
      console.error('Failed to write audit log to file:', error);
    }
  }

  /**
   * Clean up old logs (keep only last 30 days in memory)
   */
  cleanup() {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    this.logs = this.logs.filter(log => new Date(log.timestamp) >= thirtyDaysAgo);
  }

  /**
   * Export logs to file
   */
  async exportLogs(filePath, filters = {}) {
    const { logs } = this.getLogs(filters);
    
    try {
      const logData = logs.map(log => JSON.stringify(log)).join('\n');
      await fs.writeFile(filePath, logData);
      return { success: true, count: logs.length };
    } catch (error) {
      console.error('Failed to export logs:', error);
      return { success: false, error: error.message };
    }
  }
}

// Create singleton instance
const auditLogger = new AuditLogger();

// Export both the class and the instance
export { AuditLogger };
export default auditLogger;