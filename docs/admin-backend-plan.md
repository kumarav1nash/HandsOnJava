# Admin Backend Integration Plan

This document enumerates the endpoints and backend capabilities the Admin dashboard expects, with acceptance criteria.

## Endpoints

- GET `/api/admin/status`
  - Returns: `{ healthy: boolean, version: string, events: Array<{ timestamp: string, severity: 'info'|'warning'|'error', message: string }> }`
  - Acceptance: responds in <300ms; `events` capped at 100 items.

- GET `/api/admin/active-users`
  - Returns: `{ count: number, trend?: { delta: number } }`
  - Acceptance: count reflects users active in last 5 minutes.

- GET `/api/admin/performance`
  - Returns: `{ p95LatencyMs: number, reqPerMin: number, series: number[], latencyTrend?: { delta: number }, rpmTrend?: { delta: number } }`
  - Acceptance: `series` length 12 (5-minute buckets for last hour).

- GET `/api/admin/notifications`
  - Returns: `Array<{ id: string, severity: 'info'|'warning'|'error', message: string, createdAt: string }>`
  - Acceptance: sorted by `createdAt` desc, pagination optional.

- GET `/api/admin/users`
  - Returns: `Array<{ id: string, email: string, role: 'admin'|'editor'|'viewer' }>`
  - Acceptance: secured; supports `?q=` search (optional).

- PUT `/api/admin/users/:id/roles`
  - Body: `{ roles: string[] }`
  - Acceptance: idempotent; validates allowed roles.

- Problems/Test Cases (existing)
  - Ensure CORS, auth via `X-Admin-Token` header, validation errors return 400 with field messages.

## Non-functional Requirements

- Auth: All admin endpoints require `X-Admin-Token` header; 401 without/invalid.
- Rate limits: 60 rpm per IP; exempt internal health checks.
- Observability: structured logs with request id; metrics for RPS, latency, error rate.
- Audit: actions that mutate state (create/update/delete/role changes) are logged with actor, timestamp, payload hash.

## Real-time Data Streaming (Phase 3)

- Consider SSE or WebSocket endpoint at `/api/admin/events` broadcasting health/alerts.
- Backoff and heartbeat protocol; JSON lines payloads.

## Data Aggregation

- Performance aggregations computed periodically (e.g., every 1m) and cached.
- Provide time windows via query params (e.g., `?window=1h`).

## Acceptance Criteria Summary

- All endpoints return within SLO: 95% < 300ms.
- Proper status codes: 2xx success, 4xx client errors with messages, 5xx server errors with correlation id.
- Security: token validated; no PII leakage in logs.