-- Enhanced Course Management Schema
-- Adds support for course workflow, versioning, and improved content management

-- Add workflow and metadata to courses
ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT,
ADD COLUMN IF NOT EXISTS duration_minutes INT,
ADD COLUMN IF NOT EXISTS difficulty_level VARCHAR(20) CHECK (difficulty_level IN ('BEGINNER', 'INTERMEDIATE', 'ADVANCED')),
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'IN_REVIEW', 'PUBLISHED', 'ARCHIVED')),
ADD COLUMN IF NOT EXISTS version INT DEFAULT 1,
ADD COLUMN IF NOT EXISTS published_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS created_by VARCHAR(128),
ADD COLUMN IF NOT EXISTS tags TEXT[], -- Array of tags for categorization
ADD COLUMN IF NOT EXISTS prerequisites TEXT[]; -- Array of prerequisite course IDs

-- Add metadata to course pages
ALTER TABLE course_pages
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS estimated_time_minutes INT,
ADD COLUMN IF NOT EXISTS icon VARCHAR(50), -- Icon identifier for UI
ADD COLUMN IF NOT EXISTS is_preview BOOLEAN DEFAULT FALSE; -- Whether this page can be previewed without enrollment

-- Add enhanced section support
ALTER TABLE page_sections
ADD COLUMN IF NOT EXISTS title TEXT,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS estimated_time_minutes INT,
ADD COLUMN IF NOT EXISTS is_required BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS passing_score INT DEFAULT 0, -- For graded sections
ADD COLUMN IF NOT EXISTS max_attempts INT DEFAULT NULL; -- NULL means unlimited attempts

-- Add practice section support (new section type)
CREATE TYPE section_type AS ENUM ('CONCEPT', 'CODE', 'MCQ', 'PRACTICE');

-- Update existing type column to use the new enum
ALTER TABLE page_sections 
ALTER COLUMN type TYPE section_type USING type::section_type;

-- Practice section details
CREATE TABLE IF NOT EXISTS practice_sections (
  section_id BIGINT PRIMARY KEY REFERENCES page_sections(id) ON DELETE CASCADE,
  instructions TEXT NOT NULL,
  starter_code TEXT,
  solution_code TEXT,
  test_cases JSONB, -- Array of test cases
  hints TEXT[], -- Array of hints
  validation_rules JSONB -- Custom validation rules
);

-- Enhanced MCQ support
ALTER TABLE mcq_questions
ADD COLUMN IF NOT EXISTS question_type VARCHAR(20) DEFAULT 'SINGLE_CHOICE' CHECK (question_type IN ('SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'TRUE_FALSE')),
ADD COLUMN IF NOT EXISTS points INT DEFAULT 1,
ADD COLUMN IF NOT EXISTS shuffle_options BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS show_explanation_after BOOLEAN DEFAULT TRUE;

-- Add feedback for MCQ options
ALTER TABLE mcq_options
ADD COLUMN IF NOT EXISTS feedback TEXT, -- Feedback when this option is selected
ADD COLUMN IF NOT EXISTS explanation TEXT; -- Detailed explanation for this option

-- Course version history for audit trail
CREATE TABLE IF NOT EXISTS course_versions (
  id BIGSERIAL PRIMARY KEY,
  course_id VARCHAR(128) NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  version INT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  summary TEXT,
  level VARCHAR(32),
  difficulty_level VARCHAR(20),
  duration_minutes INT,
  tags TEXT[],
  prerequisites TEXT[],
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_by VARCHAR(128),
  change_summary TEXT, -- Summary of changes in this version
  UNIQUE(course_id, version)
);

-- Course content snapshots for versioning
CREATE TABLE IF NOT EXISTS course_content_snapshots (
  id BIGSERIAL PRIMARY KEY,
  course_id VARCHAR(128) NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  version INT NOT NULL,
  content_type VARCHAR(20) NOT NULL CHECK (content_type IN ('PAGE', 'SECTION', 'QUESTION', 'OPTION')),
  content_id BIGINT NOT NULL,
  content_data JSONB NOT NULL, -- Snapshot of the content
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_by VARCHAR(128),
  change_type VARCHAR(20) CHECK (change_type IN ('CREATE', 'UPDATE', 'DELETE'))
);

-- User progress tracking (for enrolled users)
CREATE TABLE IF NOT EXISTS user_course_progress (
  id BIGSERIAL PRIMARY KEY,
  user_id VARCHAR(128) NOT NULL,
  course_id VARCHAR(128) NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  page_id BIGINT REFERENCES course_pages(id) ON DELETE CASCADE,
  section_id BIGINT REFERENCES page_sections(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'NOT_STARTED' CHECK (status IN ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED')),
  score INT DEFAULT NULL, -- Score for graded sections
  attempts INT DEFAULT 0,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  time_spent_seconds INT DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, course_id, section_id)
);

-- Course analytics summary
CREATE TABLE IF NOT EXISTS course_analytics (
  id BIGSERIAL PRIMARY KEY,
  course_id VARCHAR(128) NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  total_enrollments INT DEFAULT 0,
  total_completions INT DEFAULT 0,
  average_completion_time_minutes INT,
  average_rating DECIMAL(3,2),
  total_ratings INT DEFAULT 0,
  last_activity_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(course_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_courses_status ON courses(status);
CREATE INDEX IF NOT EXISTS idx_courses_level ON courses(level);
CREATE INDEX IF NOT EXISTS idx_courses_difficulty ON courses(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_courses_created_by ON courses(created_by);
CREATE INDEX IF NOT EXISTS idx_courses_published_at ON courses(published_at);
CREATE INDEX IF NOT EXISTS idx_course_versions_course_id ON course_versions(course_id);
CREATE INDEX IF NOT EXISTS idx_course_content_snapshots_course_version ON course_content_snapshots(course_id, version);
CREATE INDEX IF NOT EXISTS idx_user_course_progress_user_course ON user_course_progress(user_id, course_id);
CREATE INDEX IF NOT EXISTS idx_user_course_progress_section ON user_course_progress(section_id);
CREATE INDEX IF NOT EXISTS idx_practice_sections_section ON practice_sections(section_id);

-- Full-text search support for courses
CREATE INDEX IF NOT EXISTS idx_courses_search 
ON courses USING gin(to_tsvector('english', title || ' ' || COALESCE(description, '') || ' ' || COALESCE(summary, '')));