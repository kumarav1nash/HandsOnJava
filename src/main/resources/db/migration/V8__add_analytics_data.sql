-- Add analytics_data column to courses table
-- Migration to add missing analytics_data column for course analytics

ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS analytics_data TEXT; -- JSON data for analytics