## Overview
- Replace in-memory Learn data with API-backed fetching, preserving a fallback to current files during development.
- Minimal, safe changes: introduce a Learn API client, feature flag, and update Learn pages to fetch courses/modules from `/api/learn/*`.

## Learn API Client
- Add `client/src/services/learnApi.js`:
  - `API_BASE_URL = import.meta.env.VITE_PUBLIC_API_BASE_URL || '/api'`
  - `getCourses() → GET /learn/courses`
  - `getCourse(id) → GET /learn/courses/:id`
  - `getConcept(id) → GET /learn/concepts/:id`
  - `getMcq(id) → GET /learn/mcq/:id`
  - `getPractice(id) → GET /learn/practices/:id`
  - Handle JSON parsing, errors, and timeouts cleanly.

## Feature Flag & Fallback
- Use `import.meta.env.VITE_LEARN_USE_API === 'true'` to prefer API.
- If API fails or flag is off, fall back to in-memory modules:
  - `courses.js`, `concepts.js`, `practices.js`, `mcqData.js`.

## Page Integrations
- `client/src/pages/learn/Courses.jsx`:
  - When flag is on, fetch list from `getCourses()` and render.
  - Map API course objects to existing card shape; derive `modules` from API response or from `conceptIds` if present.
  - Show loading and error states.

- `client/src/pages/learn/Course.jsx`:
  - On mount, fetch `getCourse(courseId)` when flag is on.
  - Use `course.modules` from API (or map `conceptIds` to modules); keep local progress in `localStorage` intact.
  - Pass module `refId` to child pages.

- `client/src/pages/learn/Concept.jsx`:
  - When flag is on, fetch `getConcept(conceptId)`; sanitize overview (DOMPurify) before render.
  - Keep navigation between concepts by fetching previous/next as needed or use in-memory concept order as fallback.

- `client/src/pages/learn/Practice.jsx`:
  - Fetch `getPractice(exerciseId)` when flag is on; retain `usePersistentProblemCode` and compiler client usage.

- `client/src/pages/learn/MCQ.jsx`:
  - Fetch `getMcq(mcqId)` when flag is on; render questions and options.

## UI/UX & Errors
- Add consistent loading spinners and error messages (reuse existing components/styles where available).
- Log API errors to console during development; show friendly messages to users.

## Security
- Sanitize any HTML content in concepts with `dompurify` before `dangerouslySetInnerHTML`.
- No auth required for public Learn endpoints; ensure requests use correct base path.

## Config
- Add `.env` entries:
  - `VITE_LEARN_USE_API=true`
  - `VITE_PUBLIC_API_BASE_URL=http://localhost:3005/api` (adjust to your server)

## Verification
- Create a Learn course via Admin Builder and modules.
- In the client Learn catalog, confirm the course appears when flag enabled.
- Open the course and step through modules; confirm concept/MCQ/practice render from API.
- Toggle flag off to verify fallback continues working.

## Files to Change
- Create: `client/src/services/learnApi.js`
- Update: `client/src/pages/learn/Courses.jsx`, `Course.jsx`, `Concept.jsx`, `Practice.jsx`, `MCQ.jsx`
- Optional: `client/src/config.ts` for centralized env access.

## Notes
- Changes avoid breaking current behavior via feature flag.
- We keep SOLID by isolating API logic in one client module and preserving component responsibilities.
- No duplication: shared fetch utilities will be reused across pages.