## Overview
Create an admin dashboard to author Learn content end‑to‑end: courses, pages/modules and their content (Concept, MCQ, Practice). Backend provides persistent storage and APIs; frontend provides rich editors and workflows. Reuse existing admin framework and security.

## Backend
### Data Model (JPA)
- CourseEntity: id (UUID), title, summary, level, createdAt, updatedAt
- CourseModuleEntity: id, courseId (FK), position, type (enum: CONCEPT|MCQ|PRACTICE), refId, createdAt
- ConceptEntity: id, title, overview (TEXT), requiresCoding (boolean)
- ConceptExampleEntity: id, conceptId (FK), title, code (TEXT), explanation (TEXT), position
- McqSetEntity: id, title
- McqQuestionEntity: id, setId (FK), prompt (TEXT), position
- McqOptionEntity: id, questionId (FK), text (TEXT), correct (boolean), position
- PracticeEntity: id, title, goal, starterCode (TEXT), stdin (TEXT), expectedStdout (TEXT), hint (TEXT)

### Repositories (Spring Data)
- CourseEntityRepository, CourseModuleEntityRepository
- ConceptEntityRepository, ConceptExampleEntityRepository
- McqSetRepository, McqQuestionRepository, McqOptionRepository
- PracticeRepository

### Services (SOLID)
- LearnCourseService: CRUD courses/modules, assemble CourseDTO
- ConceptService: CRUD concepts/examples
- McqService: CRUD sets/questions/options; evaluate answers
- PracticeService: CRUD practices
- DTO mappers for entity↔DTO

### Controllers & Endpoints
- Admin authoring (secured): `/api/admin/learn/*`
  - Courses: `POST /courses`, `GET /courses`, `GET /courses/{id}`, `PUT /courses/{id}`, `DELETE /courses/{id}`
  - Modules: `POST /courses/{id}/modules` (bulk upsert ordered list), `DELETE /courses/{id}/modules/{moduleId}`
  - Concepts: `POST /concepts`, `PUT /concepts/{id}`, `GET /concepts/{id}`, `DELETE /concepts/{id}`; examples: `POST /concepts/{id}/examples`, `PUT /concepts/examples/{exampleId}`, `DELETE /concepts/examples/{exampleId}`
  - MCQ: `POST /mcq/sets`, `PUT /mcq/sets/{id}`, `GET /mcq/sets/{id}`, `DELETE /mcq/sets/{id}`; nested: `POST /mcq/sets/{id}/questions`, `PUT /mcq/questions/{id}`, `DELETE /mcq/questions/{id}`; options similar
  - Practice: `POST /practices`, `PUT /practices/{id}`, `GET /practices/{id}`, `DELETE /practices/{id}`
- Public read:
  - `GET /api/learn/courses`, `GET /api/learn/courses/{id}` (assembled with modules)
  - `GET /api/learn/concepts/{id}`
  - `GET /api/learn/mcq/{id}` (options without `correct` in public read)
  - `POST /api/learn/mcq/{id}/check` `{ answers }` → `{ correct, total, results: [{ correct, explanation }] }`
  - `GET /api/learn/practices/{id}`

### Validation/Security
- Bean validation on DTOs; enforce module ordering and enum values.
- Reuse existing admin security gate for `/api/admin` controllers.

### Persistence & Migrations
- Flyway migration: `VXX__learn_tables.sql` create tables, indices, FKs; enum mapping for module type.
- Seed initial OOP sample course via migration or admin API.

## Frontend Admin Dashboard
### Architecture
- Extend AdminPanel routing to include Learn authoring pages under `/admin/learn/*` (client/src/components/AdminPanel.jsx)
- API clients: `client/src/services/learnAdminClient.js`, `client/src/services/learnPublicClient.js`

### Pages/Components (under `client/src/admin/pages/learn/`)
- CoursesList.jsx: list/search/sort courses; actions: create, edit, delete
- CourseEditor.jsx: edit title/summary/level; manage ordered modules via drag‑and‑drop; add module (Concept/MCQ/Practice) with ref selection/creation
- ConceptEditor.jsx: title, requiresCoding, overview rich text; examples table (title/code/explanation), add/edit/delete; inline Monaco for examples (read‑only output preview optional)
- MCQEditor.jsx: set title; question list; per question prompt and options; mark correct; explanation; reorder; preview
- PracticeEditor.jsx: title, goal, starterCode (Monaco), stdin, expectedStdout, hint; run preview using existing `/api/java/run`
- Preview panel: render module as seen by learners

### UX Details
- Distraction‑free editors with split layout: form on left, preview on right
- Keyboard: Cmd/Ctrl+S save; Esc cancel; Tab order logical
- Validation badges, inline errors, confirmation modals
- i18n for labels, tooltips in admin pages

### Integration with Learner Flow
- Learner frontend reads from public Learn endpoints; keeps existing fallback to local registries if backend content not present
- Auto‑advance and Next/Prev stay as implemented

## Java OOP Sample Course (Authoring)
- Course: Java OOP
- Modules (ordered): Concept (Encapsulation), MCQ (Encapsulation), Practice (Account invariants), MCQ (Polymorphism), Practice (Area calculator), MCQ (Interfaces), Practice (Strategy greeter)
- Rich concept content with multiple examples and explanations

## Acceptance Criteria
- Admin can create/edit/delete courses and compose modules; manage concepts/MCQs/practices
- Public endpoints serve structured content; learner UI renders it
- Practice preview runs code via `/api/java/run`; MCQ check endpoint evaluates correctness
- Validation, error handling, and security conform to existing patterns

## Phases
1. Backend: entities, repos, services, controllers, DTOs, Flyway migration
2. Frontend admin: pages, API clients, preview panes
3. Seed OOP course; connect learner UI to backend
4. QA: accessibility, i18n, performance, error handling

## Notes
- Follow SOLID: separate services, DTO mapping, avoid duplication
- Modular frontend with reusable form and preview widgets
- Future: versioning/publishing workflow, analytics, user progress tracking