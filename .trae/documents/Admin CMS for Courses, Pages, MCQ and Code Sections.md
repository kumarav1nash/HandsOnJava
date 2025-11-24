## Overview

* Build an admin CMS to create/manage courses, define course pages, and add content sections: MCQ and Code (practice) sections

* Align with existing Spring Boot backend, admin token guard and client AdminPanel navigation

* Expose public read APIs for the learn experience and admin CRUD APIs protected by `X-Admin-Token` (server guard: src/main/java/com/example/compiler/security/AdminTokenInterceptor.java:21)

## Data Model (JPA + Memory)

* CourseEntity: `id`, `slug`, `title`, `summary`, `level`, `status`, timestamps

* CoursePageEntity: `id`, `course_id`, `title`, `order`, `path` (optional), timestamps

* PageSectionEntity (base): `id`, `page_id`, `type` enum (`CONCEPT`, `MCQ`, `CODE`), `order`

  * ConceptSectionEntity: `content` (Markdown/plain), optional `resources`

  * MCQSectionEntity: 1:N `MCQQuestionEntity`

    * MCQQuestionEntity: `id`, `section_id`, `prompt`, `explanation`

    * MCQOptionEntity: `id`, `question_id`, `text`, `correct` boolean

  * CodeSectionEntity: `problem_id` reference to existing `ProblemEntity` (reuse Problems domain)

* Memory repositories mirror JPA interfaces (like ProblemRepository wiring in src/main/java/com/example/compiler/config/RepositoryConfig.java:19) to support `storage.type: memory`

## Persistence & Migrations

* Flyway SQL migrations under `src/main/resources/db/migration` to create tables and indexes

* Add entity repositories and adapters similar to `JpaProblemRepositoryAdapter` and `MemoryProblemRepository` patterns

* Extend `RepositoryConfig` to provide beans for Course/Page/Section repos for both `jpa` and `memory` modes (src/main/java/com/example/compiler/config/RepositoryConfig.java:19)

## DTOs & Mapping

* Define DTOs for Course, Page, Section, MCQQuestion/Option; keep API stable and avoid leaking JPA internals

* Mapper classes to convert between entities and DTOs; small, focused services per aggregate (CourseService, PageService, SectionServices) following SOLID

## Admin APIs (CRUD)

* Base path `/api/admin/courses` (JSON; guarded by token)

  * `POST /api/admin/courses` → create course

  * `PUT /api/admin/courses/{id}` → update course metadata

  * `DELETE /api/admin/courses/{id}` → delete course (with cascade options)

  * `GET /api/admin/courses` → list for admin management

* Pages:

  * `POST /api/admin/courses/{courseId}/pages` → create page (with `title`, `order`)

  * `PUT /api/admin/pages/{pageId}` → update page

  * `DELETE /api/admin/pages/{pageId}` → delete page

  * `POST /api/admin/courses/{courseId}/pages/reorder` → bulk reorder

* Sections:

  * `POST /api/admin/pages/{pageId}/sections` → create section `{type}`

  * `PUT /api/admin/sections/{sectionId}` → update section metadata/order

  * `DELETE /api/admin/sections/{sectionId}`

* MCQ management:

  * `POST /api/admin/sections/{sectionId}/mcq/questions` → add question

  * `PUT /api/admin/mcq/questions/{questionId}` → update question

  * `DELETE /api/admin/mcq/questions/{questionId}`

  * `POST /api/admin/mcq/questions/{questionId}/options` → add option

  * `PUT /api/admin/mcq/options/{optionId}` → update option

  * `DELETE /api/admin/mcq/options/{optionId}`

* Code section:

  * `PUT /api/admin/sections/{sectionId}/code` → set or update `problemId` reference (reuses existing admin problems APIs at src/main/java/com/example/compiler/controller/AdminProblemsController.java:18)

* Import/Export:

  * `POST /api/admin/courses/import` (JSON pack)

  * `GET /api/admin/courses/{id}/export` (JSON)

## Public APIs (Learn)

* `GET /api/courses` → list public courses (minimal fields)

* `GET /api/courses/{id}` → full course with pages and sections

* `GET /api/pages/{id}` → page with sections (used by learn router)

* Resolve MCQ and Code section data via this API (replace static files `client/src/pages/learn/courses.js` and `client/src/pages/learn/mcqData.js`)

## Backend Services & Validation

* Services: `CourseService`, `PageService`, `SectionService`, `MCQService` with clear responsibilities

* Validation in controllers like existing `validate` in AdminProblemsController (src/main/java/com/example/compiler/controller/AdminProblemsController.java:38)

* Transactions around multi-step operations (create page + sections)

## Client Admin UI

* Navigation: add “Courses” under Admin → Content (client/src/components/AdminPanel.jsx:54)

* Screens under `client/src/admin/pages/`:

  * CoursesPage: list/create/update/delete courses

  * CourseStructurePage: manage pages and order (drag-and-drop)

  * PageEditorPage: add/edit sections; for Concept → textarea with preview; MCQ → question/option editor; Code → select existing problem by id

* Use existing admin token pattern (client/src/admin/AdminGate.jsx:3 and client/src/services/adminApi.js:6)

* New client services module `coursesAdminApi.js` and `coursesClient.js` for admin/public endpoints

## Learn UI Integration

* Update `Course.jsx` to fetch course structure via public API instead of static modules (client/src/pages/learn/Course.jsx:9)

* Replace `MCQ.jsx` data source from `getMcq(mcqId)` to the section’s payload; preserve current scoring/UX (client/src/pages/learn/MCQ.jsx)

* Practice/Code sections reuse existing Problems run/submit flow via problem id

## Security & Access

* Reuse `X-Admin-Token` guard (server-side interceptor already wires `/api/admin/**`)

* CORS remains as-is for public endpoints; admin pages available only when client `VITE_ADMIN_TOKEN` is set (client-side gate)

## Testing

* Backend: controller tests for admin/public endpoints; repository tests for JPA and memory modes (mirror `AdminProblemsControllerTest` at src/test/java/com/example/compiler/controller/AdminProblemsControllerTest.java)

* Client: integrate API calls with simple mocks or dev server; smoke tests for admin flows

## Delivery Phases

1. Backend entities, repositories, migrations, services, DTOs
2. Admin CRUD endpoints + basic tests
3. Client admin pages (Courses, Structure, Page Editor) wired to endpoints
4. Public endpoints and Learn UI switch-over from static to API
5. MCQ editor polish and Code section linkage to Problems
6. Import/export JSON packs and final tests

## Notes

* No additional libraries required; concept content uses plain textarea with simple preview initially

* Code sections reference existing Problems domain for evaluation and reuse

* Align to SOLID, modular services, avoid duplication and keep DTOs coherent

