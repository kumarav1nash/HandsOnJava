## Findings
- The preview route is currently a placeholder: `admin/src/App.jsx:48` renders `<div>Course Preview</div>`, so navigating to `/courses/preview/:id` shows nothing.
- No preview page exists in the codebase (`CoursePreviewPage.jsx` or similar not found).
- Existing preview UX is implemented only inside `CourseCreatePage` via a local preview mode of the form state, not for existing courses.
- `CourseEditPage` navigates to `/admin/courses/preview/:id` but relies on the missing page.

## Plan
- Create a real preview page using the established patterns:
  - New `src/pages/courses/CoursePreviewPage.jsx` that fetches by `id` with React Query (`GET /api/admin/courses/:id`), using `useAuthStore` for guarded `Authorization` header.
  - Render preview using the same structure and styling as `CourseCreatePage` preview (title, short description, meta, learning objectives, sanitized HTML content, attachments, thumbnail, tags).
  - Sanitize `content` HTML with `dompurify` before `dangerouslySetInnerHTML`.
  - Provide clear loading and error UI.
- Wire the route:
  - Replace the placeholder at `admin/src/App.jsx:48` with `<CoursePreviewPage />`.
- Optional helper:
  - If the GET endpoint is unavailable, fall back to fetching from the list (search endpoint) and selecting the matching `id`, or show a friendly message indicating missing data.

## Seed Samples (Optional but Requested)
- Add a small "Add Sample Courses" action in `CourseManagementPage.jsx` to POST 3 DRAFT samples to `POST /api/admin/courses`, reusing the `CourseCreatePage` request shape and token guards; invalidate `['courses']` on success so they appear immediately.

## Verification
- Create the samples, open the management list, choose "Preview Course"; confirm the preview page shows real content.
- Also verify preview for manually created drafts from `Create New Course`.