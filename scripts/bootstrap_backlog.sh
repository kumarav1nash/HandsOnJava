#!/usr/bin/env bash
set -euo pipefail

REPO="kumarav1nash/HandsOnJava"

echo "==> Backlog bootstrap targeting repo: ${REPO}"

if ! command -v gh >/dev/null 2>&1; then
  echo "ERROR: GitHub CLI (gh) not found. Install with 'brew install gh' and run 'gh auth login'." >&2
  exit 1
fi

if ! gh auth status >/dev/null 2>&1; then
  echo "ERROR: gh is not authenticated. Run 'gh auth login' first." >&2
  exit 1
fi

label() {
  local name="$1"; local color="$2"; local desc="$3"
  gh label create "$name" --repo "$REPO" --color "$color" --description "$desc" 2>/dev/null || true
}

ensure_milestone() {
  local title="$1"
  # Try to find milestone by title using GitHub API
  local number
  number=$(gh api -X GET "repos/${REPO}/milestones?state=all" --jq ".[] | select(.title==\"${title}\") | .number" 2>/dev/null || true)
  if [[ -z "${number}" ]]; then
    gh api -X POST "repos/${REPO}/milestones" -f title="${title}" >/dev/null
    echo "++ Milestone created: ${title}"
  else
    echo "-- Milestone exists: ${title} (#${number})"
  fi
}

issue_exists() {
  local title="$1"
  gh issue list --repo "$REPO" --state all --search "$title" | grep -F "$title" >/dev/null 2>&1
}

create_issue() {
  local title="$1"; shift
  local labels="$1"; shift
  local milestone="$1"; shift
  local body="$1"; shift || true
  if issue_exists "$title"; then
    echo "-- Skipping existing issue: $title"
  else
    gh issue create --repo "$REPO" --title "$title" --label "$labels" --milestone "$milestone" --body "$body"
    echo "++ Created: $title"
  fi
}

echo "==> Creating labels"
label "type:epic" FFD700 "High-level initiative"
label "type:story" 1F75FE "Feature-level item"
label "type:task" 8A2BE2 "Implementation task"
label "track:dsa" 32CD32 "DSA content track"
label "track:lld" FF8C00 "LLD content track"
label "track:java" 00CED1 "Java learning track"
label "area:runner" 00BFFF "Sandbox and execution"
label "area:controller" 40E0D0 "API controllers"
label "area:cms" FF69B4 "Content authoring"
label "area:ui" 9370DB "Frontend UI"
label "area:analytics" 708090 "Analytics & insights"
label "area:infra" 2F4F4F "Infra & quality"
label "P0" DC143C "Highest priority"
label "P1" FF4500 "High priority"
label "P2" FFA500 "Medium priority"
label "status:ready" 006400 "Ready to start"
label "status:in-progress" 00008B "Currently being worked"
label "status:blocked" 8B0000 "Blocked"
label "status:done" 2E8B57 "Completed"

echo "==> Creating milestones"
ensure_milestone "Phase 0 — MVP Foundations"
ensure_milestone "Phase 1 — Track Ramps (DSA, LLD, Java)"
ensure_milestone "Phase 2 — Depth & Scale"
ensure_milestone "Phase 3 — Quality & Growth"

echo "==> Creating epic issues"
create_issue "Epic: Content Catalog" \
  "type:epic,area:cms,P0,status:ready" \
  "Phase 0 — MVP Foundations" \
  "Goal: Build a robust problem catalog with authoring tools.\nScope:\n- Problem metadata (id, title, statement, difficulty, tags, constraints)\n- Sample vs hidden tests, validators, limits\n- Versioning and audit log\nTasks:\n- [ ] Define problem & test case entities and validations\n- [ ] Implement authoring workflow: draft, review, publish\n- [ ] Editorial & hints attachments, tag taxonomy\n- [ ] Import/Export (Phase 1)\nAcceptance:\n- CRUD works; validations enforced; publish flow live"

create_issue "Epic: Execution & Judging" \
  "type:epic,area:runner,P0,status:ready" \
  "Phase 0 — MVP Foundations" \
  "Goal: Reliable sandboxed Java execution and accurate judging.\nScope:\n- Runner resource limits and cleanup\n- Comparator modes (strict/lenient/very-lenient)\n- Escaped IO decoding and output normalization\n- Hidden tests & anti-hardcode (Phase 1)\nTasks:\n- [ ] Sandbox with time/memory/stdout caps\n- [ ] Implement comparator strategies and selection\n- [ ] Centralize TextUtils.normalizeOutput + unescape\n- [ ] Hidden tests and seeded generators\nAcceptance:\n- Stable execution, correct comparisons, robust validation"

create_issue "Epic: User Experience" \
  "type:epic,area:ui,P0,status:ready" \
  "Phase 0 — MVP Foundations" \
  "Goal: Clear problem pages and a smooth code editor experience.\nScope:\n- Problem page with statement, constraints, examples, hints\n- Editor with run/submit, stdout/stderr/exit code panel\n- Track dashboards (Phase 1)\nTasks:\n- [ ] Problem page with examples and hint toggles\n- [ ] Editor integration and error surfaces\n- [ ] Track dashboards with recommended paths\nAcceptance:\n- Accessible and responsive UI; actionable error messages"

create_issue "Epic: Admin & CMS" \
  "type:epic,area:cms,P0,status:ready" \
  "Phase 0 — MVP Foundations" \
  "Goal: End-to-end content management for admins.\nScope:\n- Problem management UI\n- Test case manager (sample/hidden, validators)\n- Review workflow and publish toggle\n- Flags/moderation (Phase 2)\nTasks:\n- [ ] CRUD + validations in UI\n- [ ] Review & publish workflow\n- [ ] Flags and moderation pipeline\nAcceptance:\n- Admin can author, review, and publish high-quality content"

create_issue "Epic: Infrastructure & Quality" \
  "type:epic,area:infra,P0,status:ready" \
  "Phase 0 — MVP Foundations" \
  "Goal: Reliable CI/CD, tests, observability, and data safety.\nScope:\n- CI with unit/integration/E2E\n- Security scans & performance checks\n- Logs/metrics/tracing; SLIs/SLOs\n- Backups & migrations\nTasks:\n- [ ] CI pipeline with critical coverage\n- [ ] Observability dashboards and alerts\n- [ ] Backup schedule and migration strategy\nAcceptance:\n- Green pipeline, observable systems, protected data"

create_issue "Epic: DSA Track" \
  "type:epic,track:dsa,P1,status:ready" \
  "Phase 1 — Track Ramps (DSA, LLD, Java)" \
  "Goal: Curated DSA learning path.\nScope:\n- Arrays/Strings seed set (10 problems)\n- Trees/Graphs; DP & Greedy (Phase 1)\nTasks:\n- [ ] Seed problems with editorial and hints\n- [ ] Tagging and calibrated constraints\nAcceptance:\n- Balanced, runnable, and passable sets across topics"

create_issue "Epic: LLD Track" \
  "type:epic,track:lld,P1,status:ready" \
  "Phase 1 — Track Ramps (DSA, LLD, Java)" \
  "Goal: Hands-on LLD practice emphasizing SOLID.\nScope:\n- Parking Lot; Splitwise/BookMyShow; Design Patterns exercises\nTasks:\n- [ ] Requirements, UML, interfaces, acceptance tests\n- [ ] Rubrics for OO design, testability, patterns\nAcceptance:\n- SOLID-compliant modular solutions viable"

create_issue "Epic: Java Track" \
  "type:epic,track:java,P1,status:ready" \
  "Phase 1 — Track Ramps (DSA, LLD, Java)" \
  "Goal: Java fundamentals to advanced modules.\nScope:\n- Fundamentals & Collections; Concurrency; IO/NIO; Streams/Lambdas\n- Spring & JPA basics (Phase 2)\nTasks:\n- [ ] Short lessons with runnable exercises\n- [ ] Editorials with pitfalls and tests\nAcceptance:\n- Learners can code and verify exercises end-to-end"

echo "==> Creating seed stories (Phase 0)"
create_issue "Implement output comparator strategies" \
  "type:story,area:controller,P0,status:ready" \
  "Phase 0 — MVP Foundations" \
  "Goal: Add strict/lenient/very-lenient output comparators.\nTasks:\n- [ ] Define comparator interface and strategies\n- [ ] Wire selection per problem\n- [ ] Unit tests across CRLF/CR/LF cases\nAcceptance:\n- lenient treats trailing newline differences as equal"

create_issue "Decode escaped inputs/expected from DB" \
  "type:story,area:controller,P0,status:ready" \
  "Phase 0 — MVP Foundations" \
  "Goal: Convert literal \\n, \\r, \\t, \\r\\n to characters.\nTasks:\n- [ ] Implement TextUtils.unescape\n- [ ] Apply in JPA adapter for test cases\n- [ ] Tests covering escaped vs raw inputs\nAcceptance:\n- No false failures from escaped strings"

create_issue "Runner: resource limits and cleanup" \
  "type:story,area:runner,P0,status:ready" \
  "Phase 0 — MVP Foundations" \
  "Goal: Stable, isolated execution with resource caps.\nTasks:\n- [ ] Time/memory/stdout caps\n- [ ] Temp dir hygiene and process cleanup\n- [ ] Actionable error diagnostics\nAcceptance:\n- Reliable runs under constraints"

create_issue "Problem & TestCase domain modeling" \
  "type:story,area:cms,P0,status:ready" \
  "Phase 0 — MVP Foundations" \
  "Goal: Define core entities with validations.\nTasks:\n- [ ] Problem entity and fields\n- [ ] TestCase entity (sample vs hidden)\n- [ ] Validations and constraints\nAcceptance:\n- CRUD validated; fields complete"

create_issue "Problem page: statement, examples, hints" \
  "type:story,area:ui,P0,status:ready" \
  "Phase 0 — MVP Foundations" \
  "Goal: Clear problem page with runnable examples and hints.\nTasks:\n- [ ] Layout with constraints and examples\n- [ ] Hint toggles (locked/penalty)\nAcceptance:\n- Accessible and informative presentation"

create_issue "Code editor: run & submit flow" \
  "type:story,area:ui,P0,status:ready" \
  "Phase 0 — MVP Foundations" \
  "Goal: Smooth run/submit with diagnostics.\nTasks:\n- [ ] Editor integration\n- [ ] Output panel: stdout/stderr/exit/time\nAcceptance:\n- Actionable errors; seamless experience"

create_issue "CI: unit/integration/E2E and quality gates" \
  "type:story,area:infra,P0,status:ready" \
  "Phase 0 — MVP Foundations" \
  "Goal: Automated quality checks and coverage.\nTasks:\n- [ ] Unit tests for utilities/services\n- [ ] Integration tests for controllers\n- [ ] E2E run/submit checks\nAcceptance:\n- Green pipeline with critical path coverage"

echo "==> Creating Phase 1 stories"
create_issue "Hidden tests & anti-hardcode protection" \
  "type:story,area:runner,P1,status:ready" \
  "Phase 1 — Track Ramps (DSA, LLD, Java)" \
  "Goal: Prevent hardcoded solutions and add hidden cases.\nTasks:\n- [ ] Hidden tests surfaced only post-submit\n- [ ] Anti-hardcode heuristics (vary I/O, randomization)\nAcceptance:\n- Hardcoded solutions fail; hidden tests integrated"

create_issue "Problem import/export (JSON/CSV)" \
  "type:story,area:cms,P1,status:ready" \
  "Phase 1 — Track Ramps (DSA, LLD, Java)" \
  "Goal: Enable bulk content operations.\nTasks:\n- [ ] JSON schema for problems/tests\n- [ ] CSV import of problems\n- [ ] Export endpoints\nAcceptance:\n- Round-trip import/export preserves fields and tests"

create_issue "Track dashboards and recommendations" \
  "type:story,area:ui,P1,status:ready" \
  "Phase 1 — Track Ramps (DSA, LLD, Java)" \
  "Goal: Guide learners across DSA/LLD/Java tracks.\nTasks:\n- [ ] Track overview pages with progress\n- [ ] Recommended next items algorithm\nAcceptance:\n- Learners see progress and actionable next steps"

create_issue "Moderation flags & review workflow" \
  "type:story,area:cms,P1,status:ready" \
  "Phase 1 — Track Ramps (DSA, LLD, Java)" \
  "Goal: Keep content quality high.\nTasks:\n- [ ] Flag inappropriate/low-quality content\n- [ ] Review queues and actions\nAcceptance:\n- Moderators can triage and resolve flags"

create_issue "Progress tracking APIs & UI" \
  "type:story,area:ui,P1,status:ready" \
  "Phase 1 — Track Ramps (DSA, LLD, Java)" \
  "Goal: Persist learner progress and display it.\nTasks:\n- [ ] Progress model and endpoints\n- [ ] UI badges and streaks widget\nAcceptance:\n- Progress updates on runs/submits; streaks tracked"

create_issue "Badges and XP system" \
  "type:story,area:ui,P1,status:ready" \
  "Phase 1 — Track Ramps (DSA, LLD, Java)" \
  "Goal: Reward milestones and sustained effort.\nTasks:\n- [ ] Badge definitions and triggers\n- [ ] XP accrual rules\nAcceptance:\n- Badges awarded; XP summarized in profile"

create_issue "OAuth login (Google/GitHub) and roles" \
  "type:story,area:infra,P1,status:ready" \
  "Phase 1 — Track Ramps (DSA, LLD, Java)" \
  "Goal: Secure auth with provider logins and role-based access.\nTasks:\n- [ ] OAuth integration\n- [ ] Role middleware in API\nAcceptance:\n- Login works; role-protected routes enforced"

create_issue "Profile & settings page" \
  "type:story,area:ui,P1,status:ready" \
  "Phase 1 — Track Ramps (DSA, LLD, Java)" \
  "Goal: Let users manage account details and preferences.\nTasks:\n- [ ] Profile UI\n- [ ] Notification and privacy settings\nAcceptance:\n- Updates persist; responsive layout"

create_issue "DSA: Arrays & Strings seed pack (10 problems)" \
  "type:story,track:dsa,P1,status:ready" \
  "Phase 1 — Track Ramps (DSA, LLD, Java)" \
  "Goal: Establish beginner-friendly array/string problems with calibrations.\nTasks:\n- [ ] 10 curated problems with editorials\n- [ ] Sample + hidden tests, constraints\nAcceptance:\n- Balanced difficulty; runnable and verifiable"

create_issue "DSA: Trees & Graphs seed pack (10 problems)" \
  "type:story,track:dsa,P1,status:ready" \
  "Phase 1 — Track Ramps (DSA, LLD, Java)" \
  "Goal: Intermediate problems covering traversal/pathfinding.\nTasks:\n- [ ] 10 problems, editorial hints\n- [ ] Correctness/calibration checks\nAcceptance:\n- Diverse topics with validated tests"

create_issue "DSA: Dynamic Programming & Greedy seed pack (10 problems)" \
  "type:story,track:dsa,P1,status:ready" \
  "Phase 1 — Track Ramps (DSA, LLD, Java)" \
  "Goal: DP and greedy patterns practice set.\nTasks:\n- [ ] 10 problems with step-by-step hints\n- [ ] Calibrated constraints and tests\nAcceptance:\n- Teaches core patterns; passable with optimized solutions"

create_issue "LLD: Parking Lot exercise" \
  "type:story,track:lld,P1,status:ready" \
  "Phase 1 — Track Ramps (DSA, LLD, Java)" \
  "Goal: SOLID-compliant design and implementation.\nTasks:\n- [ ] Requirements, interfaces, UML\n- [ ] Tests and acceptance criteria\nAcceptance:\n- Modular design passing tests"

create_issue "LLD: Splitwise exercise" \
  "type:story,track:lld,P1,status:ready" \
  "Phase 1 — Track Ramps (DSA, LLD, Java)" \
  "Goal: Group expense manager with clear abstractions.\nTasks:\n- [ ] Interfaces, services, persistence layer\n- [ ] Tests and edge cases\nAcceptance:\n- SOLID design; passes acceptance tests"

create_issue "LLD: BookMyShow exercise" \
  "type:story,track:lld,P1,status:ready" \
  "Phase 1 — Track Ramps (DSA, LLD, Java)" \
  "Goal: Ticketing system with concurrency considerations.\nTasks:\n- [ ] Domain modeling\n- [ ] Concurrency-safe booking logic\nAcceptance:\n- Clean design; thread-safe operations"

create_issue "Java: Collections module exercises" \
  "type:story,track:java,P1,status:ready" \
  "Phase 1 — Track Ramps (DSA, LLD, Java)" \
  "Goal: Hands-on practice for Collections API.\nTasks:\n- [ ] Exercises and tests\n- [ ] Editor-integrated run/submit\nAcceptance:\n- Learners can complete exercises and pass tests"

create_issue "Java: Concurrency module exercises" \
  "type:story,track:java,P1,status:ready" \
  "Phase 1 — Track Ramps (DSA, LLD, Java)" \
  "Goal: Threads, locks, and executors in practice.\nTasks:\n- [ ] Exercises with race condition traps\n- [ ] Tests verifying correctness and performance\nAcceptance:\n- Correct concurrency solutions under tests"

create_issue "Java: IO/NIO module exercises" \
  "type:story,track:java,P1,status:ready" \
  "Phase 1 — Track Ramps (DSA, LLD, Java)" \
  "Goal: File and stream operations.\nTasks:\n- [ ] Read/write exercises\n- [ ] NIO pathways\nAcceptance:\n- Correct IO behavior and performance"

create_issue "Java: Streams & Lambdas module exercises" \
  "type:story,track:java,P1,status:ready" \
  "Phase 1 — Track Ramps (DSA, LLD, Java)" \
  "Goal: Functional patterns in Java.\nTasks:\n- [ ] Stream transformations\n- [ ] Collector usages and pitfalls\nAcceptance:\n- Idiomatic solutions; tested examples"

echo "==> Creating Phase 2 stories"
create_issue "Analytics: instrument key events and dashboards" \
  "type:story,area:analytics,P1,status:ready" \
  "Phase 2 — Depth & Scale" \
  "Goal: Track usage and outcomes.\nTasks:\n- [ ] Event schema and logging\n- [ ] Dashboard views\nAcceptance:\n- Actionable analytics available"

create_issue "Calibration: difficulty via pass/fail rates" \
  "type:story,area:analytics,P1,status:ready" \
  "Phase 2 — Depth & Scale" \
  "Goal: Auto-calibrate difficulty tags.\nTasks:\n- [ ] Aggregation pipeline\n- [ ] Difficulty update rules\nAcceptance:\n- Difficulty reflects observed success rates"

create_issue "Observability: dashboards and alerts" \
  "type:story,area:infra,P1,status:ready" \
  "Phase 2 — Depth & Scale" \
  "Goal: Monitor health and performance.\nTasks:\n- [ ] Metrics and tracing\n- [ ] Alerting thresholds\nAcceptance:\n- Reliable alerts; clear dashboards"

create_issue "Data safety: backups and migrations" \
  "type:story,area:infra,P1,status:ready" \
  "Phase 2 — Depth & Scale" \
  "Goal: Protect data with backup/migration processes.\nTasks:\n- [ ] Backup schedule\n- [ ] Migration scripts and rollbacks\nAcceptance:\n- Tested backups; safe migrations"

echo "==> Creating Phase 3 stories"
create_issue "Growth: A/B experiments on UX flows" \
  "type:story,area:ui,P2,status:ready" \
  "Phase 3 — Quality & Growth" \
  "Goal: Optimize key flows via experimentation.\nTasks:\n- [ ] Experiment framework\n- [ ] Measure outcomes\nAcceptance:\n- Experiments run and produce insights"

create_issue "Internationalization (i18n) groundwork" \
  "type:story,area:ui,P2,status:ready" \
  "Phase 3 — Quality & Growth" \
  "Goal: Prepare for multiple languages.\nTasks:\n- [ ] Extract strings\n- [ ] Locale switch support\nAcceptance:\n- Core UI i18n-ready"

echo "==> Backlog bootstrap completed."