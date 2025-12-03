## Goal Alignment
- Admin must create course content that the Learn UI renders page-by-page with modules: concept, MCQ, and practice.
- Deliver a single, consistent content model and admin workflow that maps 1:1 to Learn UI.

## Current State (Learn)
- Entry and pages:
  - `client/src/pages/Learn.jsx` → courses catalog
  - `client/src/pages/learn/Course.jsx` → renders a course with modules
  - `client/src/pages/learn/Concept.jsx`, `Practice.jsx`, `MCQ.jsx` → module views
- Data (in-memory):
  - `client/src/pages/learn/courses.js` (courses with `conceptIds` or `modules`)
  - `client/src/pages/learn/concepts.js` (concept objects with `steps`)
  - `client/src/pages/learn/practices.js` (practice map)
  - `client/src/pages/learn/mcqData.js` (MCQ sets)
- The Learn UI already supports mixed courses like `java-oop` with `modules: [{type:'concept'|'mcq'|'practice', id}]`.

## Current State (Admin)
- Admin app exists under `admin/src` with CRUD for courses/problems but not a Learn-ready module builder.
- CSRF/token handling present (`admin/src/stores/authStore.js`, `admin/src/services/api.js`).

## Proposed Data Model (Backend)
- `Course`:
  - `id`, `title`, `summary`, `level`, `status`, `tags`
  - `modules: Module[]` (ordered)
- `Module` (discriminated union):
  - `type: 'concept' | 'mcq' | 'practice'`
  - `refId` (ID of the module entity)
- `Concept`:
  - `id`, `title`, `summary`, `overview`, `tags`, `difficulty`
  - `starterCode` (Java)
  - `steps: {id, description, stdin, expectedStdout, hint}[]`
- `MCQSet`:
  - `id`, `title`, `questions: {prompt, options:[{id,text,correct}], explanation}[]`
- `Practice`:
  - `id`, `title`, `goal`, `starterCode`, `stdin`, `expectedStdout`, `hint`

## Admin UX & Pages (admin/src)
- `Course Builder` page to assemble modules:
  - Create course; add modules in order: Concept/MCQ/Practice.
  - Reorder modules; set status (draft/published).
- `Concept Editor`:
  - Rich text overview (TinyMCE), steps list editor, starter code editor (Monaco), difficulty/tags.
- `MCQ Editor`:
  - Questions/Options editor with correctness flags and explanations.
- `Practice Editor`:
  - Problem statement, starter code (Monaco), I/O sample and expected output, hints.
- `Preview`:
  - Course preview renders exactly like Learn pages using the same module sequence.

## Backend APIs
- Admin endpoints:
  - `POST /api/admin/learn/courses` (create), `PUT /api/admin/learn/courses/:id`, `GET /api/admin/learn/courses/:id`, `GET /api/admin/learn/courses`
  - `POST /api/admin/learn/concepts`, `PUT /api/admin/learn/concepts/:id`, `GET /api/admin/learn/concepts/:id`
  - `POST /api/admin/learn/mcq`, `PUT /api/admin/learn/mcq/:id`, `GET /api/admin/learn/mcq/:id`
  - `POST /api/admin/learn/practices`, `PUT /api/admin/learn/practices/:id`, `GET /api/admin/learn/practices/:id`
- Public Learn endpoints:
  - `GET /api/learn/courses`, `GET /api/learn/courses/:id` → returns course with `modules`
  - `GET /api/learn/concepts/:id`, `GET /api/learn/mcq/:id`, `GET /api/learn/practices/:id`
- Serialization matches Learn schemas so `client/src/pages/learn/*` can switch from in-memory to API with minimal changes.

## Publishing Workflow
- Draft → Preview → Publish toggles on course and modules.
- Prevent publish when modules or required fields are incomplete; show validation messages.

## Seed & Migration
- Seed a canonical course (`java-oop`) matching existing Learn content to validate flow.
- Provide a migration script to import current in-memory `concepts.js`, `mcqData.js`, `practices.js` into backend storage.

## Security & Consistency
- Use `import.meta.env.VITE_TINYMCE_API_KEY` for TinyMCE; include only if present.
- Keep CSRF and `Authorization` consistent via `admin/src/services/api.js` with guarded headers and `credentials: 'same-origin'`.
- Sanitize HTML before rendering (TinyMCE output) with `dompurify` on client preview.

## Implementation Phases
1. Data model and endpoints (backend) to store courses/modules.
2. Admin pages:
   - Course Builder with module ordering
   - Concept/MCQ/Practice editors
   - Course Preview rendering module sequence
3. Learn UI toggle to fetch from API (optional flag) while retaining in-memory fallback.
4. Seed `java-oop` course and verify end-to-end.
5. Validation, publish gating, and CSRF integration tests.

## Key Code References
- Learn UI
  - `client/src/pages/learn/Course.jsx` renders modules
  - `client/src/pages/learn/concepts.js`, `mcqData.js`, `practices.js` define shapes
- Admin auth & API
  - `admin/src/stores/authStore.js:14–56` login/token/CSRF
  - `admin/src/services/api.js:22–46` headers and request; add CSRF guard

## Deliverables
- Admin builder/editor pages aligned to Learn schemas
- Backend endpoints and storage
- Course preview that mirrors Learn UI
- Seeded `java-oop` course with modules (concept, MCQ, practice)
- Docs for switching Learn UI to live API