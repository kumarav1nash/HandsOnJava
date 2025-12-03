## Findings
- Mutating requests include `X-CSRF-Token` from `localStorage('adminCsrfToken')` (authStore.js:37; api.js:14–19).
- CSRF token is set on successful login. If missing/expired, server returns 403: "CSRF token validation failed".
- Seeding currently uses `fetch` directly in CourseManagementPage; headers are correct but fail if CSRF is absent or stale.

## Plan
- Add a small CSRF guard and unify request path:
  1. Create `ensureCsrf()` in `src/services/api.js`:
     - If `localStorage('adminCsrfToken')` is missing, call a CSRF endpoint (e.g., `GET /api/admin/auth/csrf`) to receive a fresh token and store it; if endpoint is unavailable, show an actionable error.
     - Always return the latest token.
  2. Explicitly set `credentials: 'same-origin'` inside `apiRequest()` so cookies are always sent with SPA requests.
  3. Refactor seeding in `CourseManagementPage.jsx` to use `adminApi.createCourse` rather than raw `fetch` and await `ensureCsrf()` before posting.
  4. Add a friendly toast when CSRF is missing/refresh fails, suggesting to log out and log back in to refresh the token (authStore already sets CSRF on login).

## Implementation Changes
- `src/services/api.js`:
  - Add `ensureCsrf()` and export it.
  - In `apiRequest`, set `credentials: 'same-origin'` and call `ensureCsrf()` before mutating methods (POST/PUT/DELETE).
- `src/pages/courses/CourseManagementPage.jsx`:
  - Import `adminApi` and `ensureCsrf`.
  - In `seedCoursesMutation`, call `ensureCsrf()` first; then use `adminApi.createCourse(sample)` for each sample.

## Validation
- Log out and log back in to ensure CSRF token is present.
- Click "Add Sample Courses"; confirm no 403.
- Preview each sample from the card menu; content renders with headings, lists, and code blocks.
- Re-click seeding; confirm duplicates are skipped and no errors are shown.

## Notes
- If `/api/admin/auth/csrf` is not available, we’ll skip auto-refresh and rely on login flow; the guard will surface a meaningful toast message.
- These changes centralize CSRF handling and reduce drift between pages by using `adminApi` for mutations.