## Overview
Design a distraction‑free Learn flow with three page types per course module: Concept (rich content with examples), MCQ (multiple‑choice questions), and Practice (hands‑on coding). Implement a sample Java OOP course to demonstrate the experience.

## Goals
- Smooth, focused session: single persistent layout, minimal chrome, keyboard‑friendly.
- Clear progression: Concept → MCQ → Practice per topic, with Prev/Next across modules.
- Reuse existing building blocks: editor, output, split panes, i18n, toasts.

## Information Architecture & Routing
- Keep `/learn` as the courses catalog.
- Add `/learn/course/:courseId` for focused session view.
- Course view loads a sequenced list of modules; each module has a `type`: `concept | mcq | practice` and a `conceptId` or `exerciseId`.
- Inside the course view, render module content with tabs hidden (single, focused section) and Prev/Next at top bar.

## Data Model
- courses.js (extend):
  - `id`, `title`, `summary`, `level`.
  - `modules: Array<{ type: 'concept'|'mcq'|'practice', id: string }>` (ordered).
- concepts.js (extend):
  - `id`, `title`, `overview` (rich text), `examples: [{title, code, explanation}]`, `requiresCoding` flag.
- mcq.js (new):
  - `id`, `title`, `questions: [{ prompt, options: [{id, text, correct}], explanation }]`.
- practices.js (new or reuse concepts):
  - For practice modules reuse existing concept steps or define `exercise` entries with `starterCode`, `stdin`, `expectedStdout`, `hint`.
- progress.js (local persistence):
  - `courseProgress[courseId] = { moduleIndex, scores: { mcqId: { correctCount, total } }, stepsCompleted: { conceptId: { stepId: true } } }` stored in `localStorage`.

## Components
- CourseSession (new):
  - Full‑screen layout; hides global Header to avoid distraction.
  - Top bar: Back to catalog, Course title, Prev/Next.
  - Renders module by type:
    - ConceptModule: rich content reader, code examples rendered read‑only; no editor unless `requiresCoding`.
    - MCQModule: list of MCQs with immediate feedback, explanations, score summary, “Try Again”.
    - PracticeModule: SplitPane with editor/output; Overview banner with goal; Run and Verify actions, step checklist (reuse existing implementations).
  - Keyboard shortcuts: `J/K` for Prev/Next module; `Enter` advances after success in MCQ/Practice.
- CoursesCatalog (existing/extended): grid of broader course categories.
- ConceptModule (new):
  - Focused reader: large type, spacing, examples in code blocks, optional diagrams (ASCII or lightweight SVG).
  - If `requiresCoding === false`, hide editor/output completely.
- MCQModule (new):
  - Single‑column questions with shuffled options; select → feedback; explanation shown; progress bar.
  - Button: “Check All” → summary; “Reset” → clear selections.
- PracticeModule (new):
  - Compose existing `EditorPane`, `OutputPane`, `RunSubmitBar`, verification logic; code persists per exercise.

## UI/UX Behaviors
- Distraction‑free:
  - Hide global header in course session; use minimal top bar only.
  - No side navigation; Prev/Next at top right.
  - Consistent typography and spacing using design tokens.
- Focus mode:
  - Concept: read‑only examples with high contrast; copy button per snippet.
  - MCQ: one question per viewport segment; smooth scroll; clear correctness states.
  - Practice: editor on the right, instructions on the left; Overview banner summarizing goal.
- Feedback:
  - Toasts for Run/Verify; inline badges for MCQ correctness.
- Accessibility:
  - ARIA roles per region (concept, mcq, practice); keyboard navigation; labels on inputs; `aria-live` for results.
- i18n:
  - Strings for MCQ/Practice actions and messages; reusing locale provider.

## Java OOP Sample Course (Content)
- Course: `java-oop`
- Modules (ordered):
  1. Concept: Encapsulation fundamentals
     - Overview: private fields, getters/setters; invariants; examples.
     - Examples:
       - Example 1: `class Account { private int balance; public int getBalance(){return balance;} public void deposit(int amt){ if(amt>0) balance+=amt; } }`
       - Explanation: maintain invariants through setters; avoid exposing mutable internals.
  2. MCQ: Encapsulation
     - Q1: Which best ensures encapsulation? Options: private fields (correct), public mutable fields, package‑private fields.
     - Q2: Setters should… enforce invariants (correct), bypass validation, always be public.
  3. Practice: Implement `Account` with deposit/withdraw constraints
     - Starter: skeleton `Account`; stdin with operations; expected stdout final balance; verify via run.
  4. Concept: Inheritance & Polymorphism
     - Overview: `extends`, method overriding, `@Override`, `super` calls.
     - Examples: `class Shape{ double area(){return 0;} } class Circle extends Shape{ double r; @Override double area(){ return Math.PI*r*r;} }`
  5. MCQ: Polymorphism
     - Q1: Dynamic dispatch selects method by… runtime type (correct), reference type, compiler flag.
     - Q2: `@Override` is used for… overriding (correct), overloading.
  6. Practice: Polymorphic area calculator
     - Starter: parse shapes from stdin; output areas; verify.
  7. Concept: Interfaces & Abstraction
     - Overview: contracts, multiple inheritance via interfaces; default methods.
     - Examples: `interface Greeter{ String greet(String name); } class CasualGreeter implements Greeter{ public String greet(String n){ return "Hi " + n; } }`
  8. MCQ: Interfaces
     - Q1: Interfaces provide… abstraction contracts (correct), state storage.
  9. Practice: Strategy pattern for greetings
     - Starter: select greeter type from stdin and produce output; verify.

## Implementation Notes
- Reuse:
  - Editor: `EditorPane` supports `readOnly` for concept modules.
  - Output & Run: `OutputPane`, `RunSubmitBar`, `compilerClient.runJava`.
- Persistence:
  - Save course module index and MCQ answers; restore on revisit.
- SOLID & Modularity:
  - Each module type is a separate component; course session orchestrates.
  - Avoid duplication by sharing verification utilities and MCQ helpers.

## Acceptance Criteria
- `/learn` shows courses catalog.
- `/learn/course/java-oop` provides a focused session, no global header.
- Concept modules show rich content and examples; MCQ modules provide feedback and scoring; Practice modules run/verify code.
- Non‑coding modules hide editor/output entirely.
- Prev/Next navigates smoothly; progress persists locally.

## Rollout Steps
1. Extend data models (courses.js, concepts.js, mcq.js, optional practices.js).
2. Implement CourseSession with module renderer and top bar.
3. Build ConceptModule, MCQModule, PracticeModule.
4. Wire routing in App to hide header in course mode.
5. Add Java OOP sample course content, MCQs, and exercises.
6. i18n keys for new labels; accessibility QA.
7. Smoke test: run course end‑to‑end; verify persistence and navigation.
