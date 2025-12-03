-- Courses and Learn Content schema
-- Courses
CREATE TABLE IF NOT EXISTS courses (
  id            VARCHAR(128) PRIMARY KEY,
  title         TEXT NOT NULL,
  summary       TEXT,
  level         VARCHAR(32),
  status        VARCHAR(32) DEFAULT 'ACTIVE',
  created_at    TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Course pages
CREATE TABLE IF NOT EXISTS course_pages (
  id            BIGSERIAL PRIMARY KEY,
  course_id     VARCHAR(128) NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  position      INT NOT NULL,
  path          TEXT,
  created_at    TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_course_pages_course_pos ON course_pages(course_id, position);

-- Page sections (base)
CREATE TABLE IF NOT EXISTS page_sections (
  id            BIGSERIAL PRIMARY KEY,
  page_id       BIGINT NOT NULL REFERENCES course_pages(id) ON DELETE CASCADE,
  type          VARCHAR(16) NOT NULL,
  position      INT NOT NULL,
  created_at    TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_page_sections_page_pos ON page_sections(page_id, position);

-- Concept section details
CREATE TABLE IF NOT EXISTS concept_sections (
  section_id    BIGINT PRIMARY KEY REFERENCES page_sections(id) ON DELETE CASCADE,
  content       TEXT NOT NULL
);

-- Code section details (link to existing problems)
CREATE TABLE IF NOT EXISTS code_sections (
  section_id    BIGINT PRIMARY KEY REFERENCES page_sections(id) ON DELETE CASCADE,
  problem_id    VARCHAR(128) NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_code_sections_problem ON code_sections(problem_id);

-- MCQ questions and options
CREATE TABLE IF NOT EXISTS mcq_questions (
  id            BIGSERIAL PRIMARY KEY,
  section_id    BIGINT NOT NULL REFERENCES page_sections(id) ON DELETE CASCADE,
  prompt        TEXT NOT NULL,
  explanation   TEXT
);
CREATE INDEX IF NOT EXISTS idx_mcq_questions_section ON mcq_questions(section_id);

CREATE TABLE IF NOT EXISTS mcq_options (
  id            BIGSERIAL PRIMARY KEY,
  question_id   BIGINT NOT NULL REFERENCES mcq_questions(id) ON DELETE CASCADE,
  text          TEXT NOT NULL,
  correct       BOOLEAN NOT NULL DEFAULT FALSE
);
CREATE INDEX IF NOT EXISTS idx_mcq_options_question ON mcq_options(question_id);

