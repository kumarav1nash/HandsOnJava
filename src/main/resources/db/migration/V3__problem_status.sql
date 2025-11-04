-- Add workflow status to problems; default to DRAFT for existing rows
ALTER TABLE problems ADD COLUMN IF NOT EXISTS status VARCHAR(32) NOT NULL DEFAULT 'DRAFT';

-- Optional: index for queries by status (e.g., review queues)
CREATE INDEX IF NOT EXISTS idx_problems_status ON problems(status);