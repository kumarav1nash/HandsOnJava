## Findings
- Spring Boot validates admin access via `X-Admin-Token` header (`AdminTokenInterceptor`), using property `admin.token` (`server/src/main/java/com/example/compiler/config/WebConfig.java`).
- `./start.sh` exports `ADMIN_TOKEN=admin_token`. Spring’s relaxed binding maps `ADMIN_TOKEN` → `admin.token`.
- Client defaults send `X-Admin-Token: admin-token` (hyphen) when `VITE_ADMIN_TOKEN` is unset (e.g., `client/src/services/coursesAdminApi.js`). This mismatches the server’s `admin_token` (underscore), causing the 401.

## Plan
1. Align Token Values
- Option A (fastest, no code change): set client env to match server:
  - In `client/.env.local` and `admin/.env.local`: `VITE_ADMIN_TOKEN=admin_token`
  - Restart dev servers. All client calls will send `X-Admin-Token: admin_token`.
- Option B: change server env to match client default (`admin-token`):
  - In `start.sh` or shell: `export ADMIN_TOKEN=admin-token` before starting Spring.
  - Restart backend.

2. Verify Headers
- Confirm requests to Spring endpoints include `X-Admin-Token` exactly and not `Authorization`.
- Check any fetch/axios wrappers in client/admin services and ensure they include `X-Admin-Token` for Java backend endpoints (not the JWT-based Node admin API).

3. Distinguish Backends
- If both Node admin API and Spring backend are used, set clear base URLs:
  - Node admin API remains at `/api/admin/...` on port 3005 (if applicable).
  - Spring Learn endpoints at `/api/admin/...` on port 8080 expect `X-Admin-Token`.
- Avoid sending Bearer tokens to Spring; use `X-Admin-Token` only.

4. Diagnostics
- After setting envs, test with curl:
  - `curl -H "X-Admin-Token: admin_token" http://localhost:8080/api/admin/health` (or another admin endpoint) → expect 200.
- Inspect logs for `Admin token not configured` to detect missing env.

5. Optional Hardening
- Add rate-limit/logging for invalid tokens.
- Consider moving token to a secret manager rather than env.

## Outcome
- Ensures clients and backend share the exact token value and header name, resolving the 401 unauthorized error without code changes. I will proceed with Option A unless you prefer Option B.