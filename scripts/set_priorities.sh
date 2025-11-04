#!/usr/bin/env bash
set -euo pipefail

REPO="kumarav1nash/HandsOnJava"

echo "==> Setting priorities for issues in ${REPO}"

if ! command -v gh >/dev/null 2>&1; then
  echo "ERROR: GitHub CLI (gh) not found. Install with 'brew install gh' and run 'gh auth login'." >&2
  exit 1
fi

if ! gh auth status >/dev/null 2>&1; then
  echo "ERROR: gh is not authenticated. Run 'gh auth login' first." >&2
  exit 1
fi

add_prio() {
  local num="$1"; local prio="$2"
  # remove any existing P* labels, ignore failures
  gh issue edit "$num" --repo "$REPO" --remove-label "P0" --remove-label "P1" --remove-label "P2" 2>/dev/null || true
  gh issue edit "$num" --repo "$REPO" --add-label "$prio"
  echo "++ #$num -> $prio"
}

label_exists() {
  gh label list --repo "$REPO" | grep -E "^$1\b" >/dev/null 2>&1
}

ensure_label() {
  local name="$1"; local color="$2"; local desc="$3"
  label_exists "$name" || gh label create "$name" --repo "$REPO" --color "$color" --description "$desc"
}

echo "==> Ensuring priority labels exist"
ensure_label "P0" DC143C "Highest priority"
ensure_label "P1" FF4500 "High priority"
ensure_label "P2" FFA500 "Medium priority"

echo "==> Classifying and updating issues"

# Infra-first classification: area:infra, area:analytics -> P2
echo "-- Infra & Analytics -> P2"
for num in $(gh issue list --repo "$REPO" --state open --label "area:infra" --json number --jq '.[].number'); do
  add_prio "$num" "P2"
done
for num in $(gh issue list --repo "$REPO" --state open --label "area:analytics" --json number --jq '.[].number'); do
  add_prio "$num" "P2"
done

# Development categories: ui, cms, controller, runner, and track:* -> prioritize by milestone
dev_filter='any(.labels[]?.name; . == "area:ui" or . == "area:cms" or . == "area:controller" or . == "area:runner" or . == "track:dsa" or . == "track:lld" or . == "track:java")'

echo "-- Development (Phase 0) -> P0"
for num in $(gh issue list --repo "$REPO" --state open --milestone "Phase 0 — MVP Foundations" --json number,labels --jq ".[] | select(${dev_filter}) | .number"); do
  add_prio "$num" "P0"
done

echo "-- Development (Phase 1–3) -> P1"
for ms in "Phase 1 — Track Ramps (DSA, LLD, Java)" "Phase 2 — Depth & Scale" "Phase 3 — Quality & Growth"; do
  for num in $(gh issue list --repo "$REPO" --state open --milestone "$ms" --json number,labels --jq ".[] | select(${dev_filter}) | .number"); do
    add_prio "$num" "P1"
  done
done

echo "==> Priority updates completed."