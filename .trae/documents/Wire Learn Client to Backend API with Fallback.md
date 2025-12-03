## Approach
- Introduce a small Learn API client and a feature flag to prefer API data while retaining in‑memory fallback.
- Update Learn pages (Courses, Course, Concept, Practice, MCQ) to fetch from `/api/learn/*` when the flag is enabled.

## Client Learn API
- Create `client/src/services/learnApi.js`:
  - Base: `import.meta.env.VITE_PUBLIC_API_BASE_URL || '/api'`
  - Methods: `getCourses()`, `getCourse(id)`, `getConcept(id)`, `getMcq(id)`, `getPractice(id)`
  - Simple `fetch` wrapper with JSON parse and error handling.

## Feature Flag & Config
- Add `VITE_LEARN_USE_API=true` in client `.env`.
- Add `VITE_PUBLIC_API_BASE_URL=http://localhost:3005/api` to match your admin server.

## Page Integrations
- `client/src/pages/learn/Courses.jsx`:
  - If flag on: load courses via `getCourses()` with loading/error states; compute progress like today.
  - Else: keep using `courses.js`.
- `client/src/pages/learn/Course.jsx`:
  - If flag on: load `getCourse(courseId)` and use `course.modules` or map `conceptIds`.
  - Persist progress in `localStorage` unchanged.
- `client/src/pages/learn/Concept.jsx`:
  - If flag on: load `getConcept(conceptId)`; sanitize overview HTML using `dompurify`.
- `client/src/pages/learn/Practice.jsx`:
  - If flag on: load `getPractice(exerciseId)`; retain `usePersistentProblemCode` & compiler client.
- `client/src/pages/learn/MCQ.jsx`:
  - If flag on: load `getMcq(mcqId)` and render questions/options.

## UX & Safety
- Use existing design system classes for spinners and messages.
- On API errors, show a friendly message and allow retry; log details to console in dev.

## Verification
- Create Learn content via Admin Builder.
- With `VITE_LEARN_USE_API=true`, open `/learn`; courses and modules should reflect backend.
- Toggle flag off to confirm in-memory fallback still works.

## Notes
- Minimal invasive edits; SOLID preserved by isolating fetch logic in a single client module.
- No duplication: pages import a single API client and reuse it across modules.