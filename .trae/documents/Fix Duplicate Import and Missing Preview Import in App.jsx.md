## Issues Identified
- Duplicate import: `import CourseEditPage ...` appears twice (admin/src/App.jsx:9 and 10).
- Missing import: `CoursePreviewPage` is used in routes but not imported.

## Fix Plan
- Edit `admin/src/App.jsx`:
  - Remove the second duplicate `import CourseEditPage` line.
  - Add `import CoursePreviewPage from './pages/courses/CoursePreviewPage'` to the import section.

## Verification
- Run the app; confirm no syntax error about duplicate identifier.
- Navigate to `/admin/courses/preview/:id`; confirm preview page renders (import resolves correctly).