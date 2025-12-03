-- Schema initialization for PostgreSQL
CREATE TABLE IF NOT EXISTS problems (
  id VARCHAR(64) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  statement TEXT NOT NULL,
  input_spec TEXT NOT NULL,
  output_spec TEXT NOT NULL,
  constraints TEXT
);

CREATE TABLE IF NOT EXISTS test_cases (
  id SERIAL PRIMARY KEY,
  problem_id VARCHAR(64) NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
  input TEXT NOT NULL,
  expected_output TEXT NOT NULL,
  is_sample BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS submissions (
  id SERIAL PRIMARY KEY,
  problem_id VARCHAR(64) NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  accepted BOOLEAN,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Seed initial problems and sample test cases (from in-memory repo)
INSERT INTO problems (id, title, statement, input_spec, output_spec, constraints) VALUES
  ('p1', 'Hello, Name', 'Read a single line as a name and print ''Hello, <name>!''', 'Input: a single line containing a name', 'Output: ''Hello, <name>!''', 'Constraints: name length <= 100 characters'),
  ('p2', 'Sum of Integers', 'Given N followed by N integers, output their sum.', 'Input: first line N, next line N space-separated integers', 'Output: one line with the sum', 'Constraints: 1 <= N <= 10^5, values |ai| <= 10^9'),
  ('p3', 'Reverse String', 'Read a string and print its reverse.', 'Input: a single line string', 'Output: reversed string', 'Constraints: string length <= 10^5')
ON CONFLICT (id) DO NOTHING;

INSERT INTO test_cases (problem_id, input, expected_output, is_sample) VALUES
  ('p1', 'Alice\n', 'Hello, Alice!\n', TRUE),
  ('p1', 'Bob\n', 'Hello, Bob!\n', TRUE),
  ('p2', '3\n1 2 3\n', '6\n', TRUE),
  ('p2', '5\n10 20 30 40 50\n', '150\n', TRUE),
  ('p3', 'hello\n', 'olleh\n', TRUE),
  ('p3', 'Java\n', 'avaJ\n', TRUE);