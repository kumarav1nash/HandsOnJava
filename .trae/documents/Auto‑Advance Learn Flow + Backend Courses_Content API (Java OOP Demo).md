## Scope Update
- Exclude backend changes for now. Implement all course and content features on the frontend using typed registries, with local persistence.

## Goals
- Focused course experience with three module types: Concept, MCQ, Practice.
- Auto‑advance on success (MCQ all correct, Practice verified), plus Prev/Next controls.
- Distraction‑free layout: minimal top bar, keyboard navigation.
- Demonstrate with Java OOP sample course (rich content).

## Frontend Architecture
- Registries (client‑side):
  - `concepts.js`: `{ id, title, overview, requiresCoding, examples: [{ title, code, explanation }] }`.
  - `mcqData.js`: `{ id, title, questions: [{ prompt, options: [{ id, text, correct }], explanation }] }`.
  - `practices.js`: `{ id, title, goal, starterCode, stdin, expectedStdout, hint }`.
  - `courses.js`: `{ id, title, summary, level, modules: [{ type: 'concept'|'mcq'|'practice', id }] }`.
- Pages/Components:
  - `Courses.jsx`: catalog of courses under `/learn`.
  - `Course.jsx`: focused session `/learn/course/:courseId` (hides global header), renders current module.
  - `Concept.jsx`: shows overview and examples; editor hidden if `requiresCoding === false`.
  - `MCQ.jsx`: renders questions with Check/Reset, explanations, score; exposes `onComplete`.
  - `Practice.jsx`: editor + output + verify; exposes `onComplete` when verification passes.

## UX & Behavior
- Top bar: Back, Course title, Prev/Next buttons.
- Auto‑advance:
  - On MCQ Check: if all correct → `onComplete` triggers Next.
  - On Practice Verify: if success (stdout match + exitCode 0) → Next.
- Keyboard shortcuts: `J` for Prev, `K` for Next, `Enter` to advance after success.
- Optional module outline (small chips) to jump; can be hidden/toggled for maximum focus.
- Local persistence: save current module index and MCQ answers in `localStorage` per course; restore on revisit.

## Java OOP Sample Course (Content)
- Modules:
  1. Concept: Encapsulation fundamentals (examples with code & explanation)
  2. MCQ: Encapsulation
  3. Practice: Account invariants
  4. MCQ: Polymorphism
  5. Practice: Area calculator
  6. MCQ: Interfaces
  7. Practice: Strategy greeter

## Implementation Steps
1. Finalize registries with rich OOP content (overview paragraphs, multiple examples per concept).
2. Wire auto‑advance in `Course.jsx` by passing `onComplete` to MCQ/Practice and invoking Next on success.
3. Add `localStorage` hooks for course progress (module index) and MCQ answers.
4. Tighten layout: hide global header in course routes; ensure minimal top bar.
5. Add keyboard handlers in `Course.jsx` (Prev/Next/Enter advance conditions).
6. i18n: add labels for MCQ/Practice actions/messages where needed.
7. Smoke test end‑to‑end for the Java OOP course.

## Acceptance Criteria
- `/learn` shows courses catalog; `/learn/course/java-oop` renders focused session.
- Concept modules display rich explanations and examples; non‑coding concepts hide editor.
- MCQ modules provide immediate feedback; auto‑advance on all correct.
- Practice modules run and verify; auto‑advance on success.
- Prev/Next and keyboard shortcuts navigate smoothly; progress persists locally.

## Notes
- SOLID: separate components per module type; shared utilities for persistence and verification.
- Future: backend authoring can replace registries later without changing component contracts.