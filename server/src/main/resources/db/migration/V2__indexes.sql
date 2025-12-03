-- Performance indexes for frequent queries
CREATE INDEX IF NOT EXISTS idx_test_cases_problem_id ON test_cases(problem_id);
CREATE INDEX IF NOT EXISTS idx_submissions_problem_id ON submissions(problem_id);