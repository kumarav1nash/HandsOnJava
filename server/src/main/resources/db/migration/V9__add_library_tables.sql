CREATE TABLE library_concepts (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    summary TEXT,
    overview TEXT,
    starter_code TEXT,
    difficulty VARCHAR(20),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE library_concept_tags (
    concept_id BIGINT NOT NULL,
    tag VARCHAR(255),
    FOREIGN KEY (concept_id) REFERENCES library_concepts(id)
);

CREATE TABLE library_concept_steps (
    concept_id BIGINT NOT NULL,
    description TEXT,
    stdin TEXT,
    expected_stdout TEXT,
    hint TEXT,
    FOREIGN KEY (concept_id) REFERENCES library_concepts(id)
);

CREATE TABLE library_mcqs (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE library_mcq_questions (
    id BIGSERIAL PRIMARY KEY,
    mcq_id BIGINT,
    prompt TEXT,
    explanation TEXT,
    FOREIGN KEY (mcq_id) REFERENCES library_mcqs(id)
);

CREATE TABLE library_mcq_options (
    question_id BIGINT NOT NULL,
    id VARCHAR(255),
    text TEXT NOT NULL,
    correct BOOLEAN NOT NULL,
    FOREIGN KEY (question_id) REFERENCES library_mcq_questions(id)
);

CREATE TABLE library_practices (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    goal TEXT,
    starter_code TEXT,
    stdin TEXT,
    expected_stdout TEXT,
    hint TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
