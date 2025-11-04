# Contributing Guide

This project follows a simple, disciplined workflow to keep engineering and backlog management aligned.

## Engineering Principles
- Follow SOLID principles in design and implementation.
- Write modular code; break methods into smaller units when needed.
- Avoid duplication; extract shared logic into utilities or common modules.

## Issue Workflow (Required)
- Always update GitHub issues while working on them:
  - Status progression: `status:ready` → `status:in_progress` → (`status:blocked` if needed) → `status:done`.
  - Add progress comments describing what changed and where.
  - Keep priority labels (`P0`, `P1`, `P2`) accurate; prioritize development tasks over infrastructure.
  - Ensure issues are assigned to the correct milestone (Phase 0–3 as appropriate).
- Create a new branch per issue:
  - Name format: `issue/<number>-<kebab-title>` (e.g., `issue/123-hidden-tests-anti-hardcode`).
  - Reference the issue in commits and PRs (e.g., `Fixes #123`).
- Keep labels tidy:
  - Type labels: `type:epic`, `type:story`, `type:bug`.
  - Track labels: `track:dsa`, `track:lld`, `track:java`, etc.
  - Status labels: `status:ready`, `status:in_progress`, `status:blocked`, `status:done`.

## Running and Testing
- Build: `./gradlew build`
- Run locally: `STORAGE_TYPE=memory ./gradlew bootRun`
- Start with Postgres: `./start.sh` (runs Docker and launches backend)
- Tests: `./gradlew test`

## Judging & Comparators
- Comparator modes: `strict`, `lenient`, `very_lenient`.
- Configure default in `application.yml` (`compare.mode.default`) and per-problem override via `compare.mode.p.<problemId>`.
- Submissions run against all (sample + hidden) tests; expected outputs are redacted in submission results; anti-hardcode detection rejects suspicious submissions.

## Pull Requests
- Keep PRs focused to a single issue or feature.
- Include rationale, key changes, and test/build results.
- Ensure CI passes before requesting review.