## Current Findings
- Admin pages for builder and preview exist and routes are wired:
  - Builder: `/admin/learn/courses/builder`
  - Preview: `/admin/learn/courses/preview/:id`
- No sidebar link to the builder, so it’s not discoverable.
- Backend endpoints for Learn content (`/api/admin/learn/*` and `/api/learn/*`) are not implemented yet; only client stubs exist. Creation and preview will fail without these.

## Plan Overview
1. Navigation & UX
- Add a sidebar item: **Learn Builder** → `/learn/courses/builder`.
- Add a CTA button on Courses management page: **Create Learn Course** linking to the builder.

2. Backend API (Admin + Public)
- Implement Admin endpoints with CSRF/auth:
  - `POST /api/admin/learn/courses` (create), `PUT /api/admin/learn/courses/:id`, `GET /api/admin/learn/courses/:id`, `GET /api/admin/learn/courses`.
  - `POST /api/admin/learn/concepts`, `GET /api/admin/learn/concepts/:id`.
  - `POST /api/admin/learn/mcq`, `GET /api/admin/learn/mcq/:id`.
  - `POST /api/admin/learn/practices`, `GET /api/admin/learn/practices/:id`.
- Implement Public Learn read endpoints (no auth required):
  - `GET /api/learn/courses`, `GET /api/learn/courses/:id` return course with `modules`.
  - `GET /api/learn/concepts/:id`, `GET /api/learn/mcq/:id`, `GET /api/learn/practices/:id`.
- Storage: start with a simple persistent store (JSON files or database depending on your stack). Include validation for each schema.

3. Admin Pages Integration
- Wire existing builder/ editors to the new admin endpoints using `adminLearnApi`.
- Ensure CSRF guard is active (already centralized in `api.js`).

4. Learn Client Integration
- Update Learn pages to fetch from Public API:
  - `client/src/pages/learn/Course.jsx` fetches course modules by ID.
  - `client/src/pages/learn/Concept.jsx`, `Practice.jsx`, `MCQ.jsx` fetch module data by ID.
- Keep an environment flag to fall back to current in-memory data during development.

5. Seeding & Migration
- Provide a seed script to insert a canonical `java-oop` course with mixed modules matching existing in-memory content.
- Optional migration script to import `client/src/pages/learn/*` into persistent storage.

6. Verification
- Admin: create a course with concept/MCQ/practice modules; preview via `/admin/learn/courses/preview/:id`.
- Public Learn: open `/learn` and ensure the new course appears; navigate through modules page-by-page.
- CSRF/auth: confirm POST/PUT require Admin auth and CSRF; GET Public endpoints are readable without auth.

7. Branch & Issue Hygiene
- Create a new branch named with the issue number/title per your workflow.
- Update related GitHub issue statuses as you implement each phase.

## Notes
- TinyMCE requires `VITE_TINYMCE_API_KEY` set in `admin/.env.local`.
- Use `dompurify` for sanitizing rich HTML in both admin preview and public Learn page rendering.
- Follow existing UI/UX conventions and SOLID principles; avoid duplication by centralizing shared helpers in `api.js` and module renderers.