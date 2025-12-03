## Current Behavior
- The preview page renders sanitized HTML from the course `content` field.
- The sample courses seeded earlier include very basic `<p>` content, so the preview appears sparse.

## Plan to Populate Rich Content
- Enhance the seeded sample courses to include structured HTML content that previews well:
  - Headings (`<h2>`, `<h3>`), paragraphs, and lists for syllabus and objectives.
  - Code examples with `<pre><code>` showcasing Java snippets.
  - Simple tables (optional) for module outlines.
  - Tag and metadata already display via preview component.
- Add duplicate protection when seeding:
  - Check existing course titles and only create a sample if it does not already exist, to avoid clutter.

## Implementation Details (Single File Update)
- Update `buildSampleCourses()` in `src/pages/courses/CourseManagementPage.jsx` to return richer `content` strings for each sample:
  - Sample 1: "Java Fundamentals" — intro, learning outcomes, a HelloWorld `class` example.
  - Sample 2: "Data Structures in Java" — topics list, example using `ArrayList` and `HashMap`.
  - Sample 3: "Algorithms with Java" — discussion of time complexity, quicksort pseudocode or Java method.
- In the seeding mutation, skip creating a sample if a course with the same `title` is already present in `courses`.

## Verification
- Click "Add Sample Courses" in Courses; it seeds only missing samples.
- Open the menu → "Preview Course" for each sample; preview shows headings, lists, and code blocks correctly.
- Confirm no duplicate samples are created on repeated clicks.

## Notes
- Content is sanitized by `dompurify` in the preview component, ensuring safe rendering.
- All changes are client-only; backend remains unchanged.
- No new files are introduced; only the sample builder and seeding logic are updated.