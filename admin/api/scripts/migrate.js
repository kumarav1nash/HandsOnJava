#!/usr/bin/env node

/**
 * Database Migration Script for Admin Module
 * 
 * This script handles database setup and migrations for the admin module.
 * It supports PostgreSQL and can be extended for other databases.
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '.env.production') });

// Database schema definitions
const schema = {
  users: `
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      name VARCHAR(100) NOT NULL,
      role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'editor', 'viewer')),
      is_active BOOLEAN DEFAULT true,
      last_login TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE INDEX idx_users_email ON users(email);
    CREATE INDEX idx_users_role ON users(role);
    CREATE INDEX idx_users_active ON users(is_active);
  `,

  courses: `
    CREATE TABLE IF NOT EXISTS courses (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title VARCHAR(200) NOT NULL,
      description TEXT NOT NULL,
      category VARCHAR(100) NOT NULL,
      difficulty VARCHAR(20) NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
      duration VARCHAR(50),
      status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
      tags TEXT[],
      learning_objectives TEXT[],
      prerequisites TEXT[],
      instructor_id UUID REFERENCES users(id),
      metadata JSONB,
      version INTEGER DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE INDEX idx_courses_category ON courses(category);
    CREATE INDEX idx_courses_difficulty ON courses(difficulty);
    CREATE INDEX idx_courses_status ON courses(status);
    CREATE INDEX idx_courses_instructor ON courses(instructor_id);
  `,

  problems: `
    CREATE TABLE IF NOT EXISTS problems (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title VARCHAR(200) NOT NULL,
      description TEXT NOT NULL,
      type VARCHAR(30) NOT NULL CHECK (type IN ('multiple-choice', 'true-false', 'coding', 'fill-blank', 'essay')),
      difficulty VARCHAR(20) NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
      points INTEGER DEFAULT 1 CHECK (points > 0 AND points <= 1000),
      time_limit INTEGER, -- in seconds
      memory_limit INTEGER, -- in MB
      hints TEXT[],
      test_cases JSONB,
      scoring_rubric JSONB,
      course_id UUID REFERENCES courses(id),
      created_by UUID REFERENCES users(id),
      metadata JSONB,
      version INTEGER DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE INDEX idx_problems_type ON problems(type);
    CREATE INDEX idx_problems_difficulty ON problems(difficulty);
    CREATE INDEX idx_problems_course ON problems(course_id);
    CREATE INDEX idx_problems_creator ON problems(created_by);
  `,

  audit_logs: `
    CREATE TABLE IF NOT EXISTS audit_logs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id),
      action VARCHAR(100) NOT NULL,
      severity VARCHAR(20) DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'error', 'critical')),
      details JSONB,
      ip_address INET,
      user_agent TEXT,
      session_id VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
    CREATE INDEX idx_audit_logs_action ON audit_logs(action);
    CREATE INDEX idx_audit_logs_severity ON audit_logs(severity);
    CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);
  `,

  sessions: `
    CREATE TABLE IF NOT EXISTS sessions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id),
      token VARCHAR(500) UNIQUE NOT NULL,
      csrf_token VARCHAR(255),
      expires_at TIMESTAMP NOT NULL,
      ip_address INET,
      user_agent TEXT,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE INDEX idx_sessions_token ON sessions(token);
    CREATE INDEX idx_sessions_user ON sessions(user_id);
    CREATE INDEX idx_sessions_expires ON sessions(expires_at);
    CREATE INDEX idx_sessions_active ON sessions(is_active);
  `,

  course_content: `
    CREATE TABLE IF NOT EXISTS course_content (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
      content_order INTEGER NOT NULL,
      title VARCHAR(200) NOT NULL,
      content_type VARCHAR(50) NOT NULL CHECK (content_type IN ('text', 'video', 'quiz', 'assignment', 'file')),
      content TEXT,
      file_url VARCHAR(500),
      duration INTEGER, -- in minutes
      is_required BOOLEAN DEFAULT true,
      metadata JSONB,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE INDEX idx_course_content_course ON course_content(course_id);
    CREATE INDEX idx_course_content_order ON course_content(course_id, content_order);
  `,

  problem_submissions: `
    CREATE TABLE IF NOT EXISTS problem_submissions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      problem_id UUID REFERENCES problems(id),
      user_id UUID REFERENCES users(id),
      submission_data JSONB,
      score INTEGER,
      max_score INTEGER,
      feedback TEXT,
      test_results JSONB,
      execution_time INTEGER, -- in milliseconds
      memory_used INTEGER, -- in bytes
      status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'graded', 'rejected')),
      graded_by UUID REFERENCES users(id),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      graded_at TIMESTAMP
    );
    
    CREATE INDEX idx_submissions_problem ON problem_submissions(problem_id);
    CREATE INDEX idx_submissions_user ON problem_submissions(user_id);
    CREATE INDEX idx_submissions_status ON problem_submissions(status);
  `
};

// Default admin user
const defaultAdmin = {
  email: 'admin@example.com',
  password: 'securePassword123',
  name: 'Administrator',
  role: 'admin'
};

class DatabaseMigrator {
  constructor() {
    this.connection = null;
    this.config = {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'admin_db',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '',
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
    };
  }

  async connect() {
    try {
      const { default: pg } = await import('pg');
      const { Pool } = pg;
      this.connection = new Pool(this.config);
      console.log('Connected to database');
    } catch (error) {
      console.error('Failed to connect to database:', error);
      throw error;
    }
  }

  async disconnect() {
    if (this.connection) {
      await this.connection.end();
      console.log('Disconnected from database');
    }
  }

  async executeQuery(query, params = []) {
    try {
      const result = await this.connection.query(query, params);
      return result;
    } catch (error) {
      console.error('Query execution failed:', error);
      throw error;
    }
  }

  async createTables() {
    console.log('Creating database tables...');
    
    for (const [tableName, createQuery] of Object.entries(schema)) {
      try {
        console.log(`Creating table: ${tableName}`);
        await this.executeQuery(createQuery);
        console.log(`✓ Table ${tableName} created successfully`);
      } catch (error) {
        console.error(`✗ Failed to create table ${tableName}:`, error.message);
        throw error;
      }
    }
  }

  async createDefaultAdmin() {
    console.log('Creating default admin user...');
    
    try {
      // Check if admin already exists
      const existingAdmin = await this.executeQuery(
        'SELECT id FROM users WHERE email = $1',
        [defaultAdmin.email]
      );

      if (existingAdmin.rows.length > 0) {
        console.log('✓ Default admin user already exists');
        return;
      }

      // Hash password
      const { default: bcrypt } = await import('bcryptjs');
      const hashedPassword = await bcrypt.hash(defaultAdmin.password, 10);

      // Insert default admin
      await this.executeQuery(
        `INSERT INTO users (email, password, name, role) 
         VALUES ($1, $2, $3, $4)`,
        [defaultAdmin.email, hashedPassword, defaultAdmin.name, defaultAdmin.role]
      );

      console.log('✓ Default admin user created successfully');
      console.log(`  Email: ${defaultAdmin.email}`);
      console.log(`  Password: ${defaultAdmin.password}`);
      console.log('  ⚠️  Please change the default password after first login');
    } catch (error) {
      console.error('✗ Failed to create default admin:', error.message);
      throw error;
    }
  }

  async createIndexes() {
    console.log('Creating additional indexes...');
    
    const indexes = [
      // Composite indexes for better performance
      'CREATE INDEX idx_audit_logs_composite ON audit_logs(user_id, action, created_at)',
      'CREATE INDEX idx_courses_search ON courses(title, category, difficulty)',
      'CREATE INDEX idx_problems_search ON problems(title, type, difficulty)',
      
      // Foreign key indexes
      'CREATE INDEX idx_course_content_fk ON course_content(course_id)',
      'CREATE INDEX idx_problem_submissions_fk ON problem_submissions(problem_id, user_id)'
    ];

    for (const indexQuery of indexes) {
      try {
        await this.executeQuery(indexQuery);
      } catch (error) {
        // Index might already exist, continue
        console.log(`Index might already exist: ${indexQuery}`);
      }
    }
    
    console.log('✓ Additional indexes created');
  }

  async createTriggers() {
    console.log('Creating database triggers...');
    
    const triggers = [
      // Updated_at trigger for users
      `
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
        END;
        $$ language 'plpgsql';
      `,
      
      // Apply updated_at trigger to relevant tables
      `
        CREATE TRIGGER update_users_updated_at 
        BEFORE UPDATE ON users 
        FOR EACH ROW 
        EXECUTE FUNCTION update_updated_at_column();
      `,
      
      `
        CREATE TRIGGER update_courses_updated_at 
        BEFORE UPDATE ON courses 
        FOR EACH ROW 
        EXECUTE FUNCTION update_updated_at_column();
      `,
      
      `
        CREATE TRIGGER update_problems_updated_at 
        BEFORE UPDATE ON problems 
        FOR EACH ROW 
        EXECUTE FUNCTION update_updated_at_column();
      `
    ];

    for (const trigger of triggers) {
      try {
        await this.executeQuery(trigger);
      } catch (error) {
        console.log(`Trigger might already exist: ${trigger}`);
      }
    }
    
    console.log('✓ Database triggers created');
  }

  async verifyInstallation() {
    console.log('Verifying database installation...');
    
    try {
      // Check if all tables exist
      const tables = Object.keys(schema);
      
      for (const table of tables) {
        const result = await this.executeQuery(
          `SELECT EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = $1
          )`,
          [table]
        );
        
        if (result.rows[0].exists) {
          console.log(`✓ Table ${table} verified`);
        } else {
          console.error(`✗ Table ${table} not found`);
          throw new Error(`Table ${table} not found`);
        }
      }
      
      console.log('✓ Database installation verified successfully');
    } catch (error) {
      console.error('✗ Database verification failed:', error.message);
      throw error;
    }
  }

  async runMigration() {
    try {
      console.log('Starting database migration...');
      
      await this.connect();
      await this.createTables();
      await this.createDefaultAdmin();
      await this.createIndexes();
      await this.createTriggers();
      await this.verifyInstallation();
      
      console.log('✓ Database migration completed successfully');
    } catch (error) {
      console.error('✗ Database migration failed:', error.message);
      throw error;
    } finally {
      await this.disconnect();
    }
  }

  async rollback() {
    console.log('Rolling back database changes...');
    
    try {
      await this.connect();
      
      const tables = Object.keys(schema).reverse();
      
      for (const table of tables) {
        try {
          await this.executeQuery(`DROP TABLE IF EXISTS ${table} CASCADE`);
          console.log(`✓ Dropped table ${table}`);
        } catch (error) {
          console.error(`✗ Failed to drop table ${table}:`, error.message);
        }
      }
      
      console.log('✓ Database rollback completed');
    } catch (error) {
      console.error('✗ Database rollback failed:', error.message);
      throw error;
    } finally {
      await this.disconnect();
    }
  }
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const migrator = new DatabaseMigrator();
  
  const command = process.argv[2] || 'migrate';
  
  switch (command) {
    case 'migrate':
      await migrator.runMigration();
      break;
    case 'rollback':
      await migrator.rollback();
      break;
    case 'verify':
      await migrator.connect();
      await migrator.verifyInstallation();
      await migrator.disconnect();
      break;
    default:
      console.log('Usage: node migrate.js [migrate|rollback|verify]');
      process.exit(1);
  }
}

export default DatabaseMigrator;