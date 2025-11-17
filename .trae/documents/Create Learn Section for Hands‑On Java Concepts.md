## Overview
- Add a new “Learn” section for hands‑on Java concepts with interactive editor, guided steps, hints, and local verification.
- Reuse existing editor, output, split panes, run flow, i18n, and design tokens for consistent UX.

## Key Features
- Concept catalog with search, filters (topic, difficulty), and badges.
- Concept detail page with:
  - Left: concept overview, goals, step checklist, hints and references.
  - Right: Monaco editor and live output using existing compile/run.
  - Local verification: compare stdout against step’s expected output for given stdin.
  - Code persistence per concept; reset to starter; load solution reveal.
  - Keyboard shortcuts (Run: Cmd/Ctrl+Enter, Submit/Verify: Cmd/Ctrl+Shift+Enter).
- Fully responsive layout, accessible roles/ARIA, and theme‑aware styling.

## Reuse Existing Building Blocks
- Editor: `client/src/components/EditorPane.jsx:4`.
- Output: `client/src/components/OutputPane.jsx:4`.
- Toolbar: `client/src/components/RunSubmitBar.jsx:3` (for Run/Verify actions).
- Split layout: `client/src/design-system/components/SplitPane.jsx:12`.
- Run service: `client/src/services/compilerClient.js:9` (`runJava(code, stdin)`).
- Code persistence hook: `client/src/utils/usePersistentProblemCode.js:3` (use with concept‑scoped key prefix).
- i18n: `client/src/i18n/LocaleProvider.jsx` and `client/src/i18n/useI18n.js`.

## IA & Routing
- New routes:
  - `/learn` → Learn catalog page.
  - `/learn/:conceptId` → Concept detail page.
- Integrate into `client/src/App.jsx` conditional router:
  - Extend main switch to render Learn pages when `location.pathname.startsWith('/learn')` (`client/src/App.jsx:274` area).
  - Optionally map Learn into header mode highlighting alongside Problems.

## Data Model
- Lightweight concept registry (static JSON/JS module): id, title, summary, tags, difficulty, starterCode, steps[] where each step has description, stdin, expectedStdout, hint.
- Keep data client‑side to avoid backend changes; allows quick iteration.

## UI/UX Details
- Catalog
  - Grid/list with cards showing title, short summary, tags, difficulty.
  - Search box; tag chips (similar interaction to ProblemsCatalog).
  - Empty state, loading skeletons, pagination (client‑side or simple chunking).
- Concept Page
  - SplitPane horizontal: left instructions, right editor/output.
  - Step checklist with completion states; hints are collapsible.
  - Toolbar: Run and Verify; Verify runs with step’s stdin and compares output.
  - Controls: Reset to starter, Copy code, Theme toggle via existing header.
  - Status toasts consistent with existing `react-hot-toast` usage.

## Accessibility & Internationalization
- ARIA roles for regions and logs; keyboard operability aligned with existing shortcuts.
- Use `useI18n` for all user‑facing strings; default English with `en.json`, add keys for Learn section.

## Implementation Steps
- Create `client/src/pages/Learn.jsx` (catalog) using patterns from `ProblemsCatalog.jsx:73` for chips, list, pagination.
- Create `client/src/pages/learn/Concept.jsx` (detail) composing `SplitPane`, `EditorPane`, `OutputPane`, and a new `StepList` component.
- Add `client/src/pages/learn/StepList.jsx` for checklist and hints; minimal design‑system styles using existing tokens.
- Add `client/src/pages/learn/concepts.js` (registry) with initial topics: Basics, OOP, Collections, Streams, Exceptions, Generics, Concurrency, I/O.
- Wire routing in `client/src/App.jsx` to render Learn pages; update header mode derivation if desired.
- Implement local verification util comparing `stdout.trim()` to `expectedStdout` per step; show success/error toasts.
- Persist code per concept using `usePersistentProblemCode(conceptId, starterCode, 'learn_code')`.

## Acceptance Criteria
- Navigating to `/learn` shows a catalog with at least 8 concepts and filters.
- Navigating to `/learn/:conceptId` shows instructions and a working editor/output.
- Run executes via backend compile/run; Verify evaluates against expected output and marks step complete.
- Code persists per concept across reloads; Reset restores starter.
- Works on mobile/tablet/desktop; passes basic keyboard and screen reader checks.

## Phase Plan
- Phase 1: Routing, catalog, concept page skeleton, run flow reuse.
- Phase 2: Step checklist, hints, local verification, persistence.
- Phase 3: Polish UX, i18n keys, accessibility sweeps, responsive tuning.
- Phase 4: Add more concepts and refine content.

## Notes
- No backend changes required initially; all content is client‑side.
- Follow SOLID and avoid duplication by encapsulating step list and verification into isolated modules; keep components small and composable.
