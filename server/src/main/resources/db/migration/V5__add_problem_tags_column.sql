-- Add tags column to problems for categorization
ALTER TABLE problems ADD COLUMN IF NOT EXISTS tags text;