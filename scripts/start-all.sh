#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

ADMIN_TOKEN="${ADMIN_TOKEN:-admin_token}"
ADMIN_API_PORT="${ADMIN_API_PORT:-3005}"
ADMIN_WEB_PORT="${ADMIN_WEB_PORT:-3001}"
SERVER_PORT="${SERVER_PORT:-8081}"
KILL_BUSY="${KILL_BUSY:-true}"

kill_port_if_busy() {
  local port="$1"
  if lsof -ti ":$port" >/dev/null 2>&1; then
    if [ "$KILL_BUSY" = "true" ]; then
      echo "Port $port busy, killing listener(s)" >&2
      lsof -ti ":$port" | xargs -r kill -9 || true
      sleep 1.5
    else
      echo "Port $port is busy. Set KILL_BUSY=true or free the port." >&2
      exit 1
    fi
  fi
}

wait_port_free() {
  local port="$1"
  local tries=0
  while lsof -ti ":$port" >/dev/null 2>&1; do
    sleep 0.5
    tries=$((tries+1))
    if [ "$tries" -gt 20 ]; then
      echo "Port $port still busy after waiting. Aborting." >&2
      exit 1
    fi
  done
}

cd "$ROOT_DIR"

# Enforce desired ports by killing any existing listeners
kill_port_if_busy "$ADMIN_API_PORT"
kill_port_if_busy "$ADMIN_WEB_PORT"
kill_port_if_busy "$SERVER_PORT"
wait_port_free "$ADMIN_API_PORT"
wait_port_free "$ADMIN_WEB_PORT"
wait_port_free "$SERVER_PORT"

( cd admin/api && PORT="$ADMIN_API_PORT" ADMIN_TOKEN="$ADMIN_TOKEN" npm run dev ) & ADMIN_API_PID=$!
sleep 0.5
( cd admin && ADMIN_WEB_PORT="$ADMIN_WEB_PORT" VITE_API_TARGET="http://localhost:$ADMIN_API_PORT" VITE_API_BASE_URL="/api" npm run dev ) & ADMIN_WEB_PID=$!
sleep 0.5
( SERVER_PORT="$SERVER_PORT" ./gradlew -q bootRun ) & JAVA_PID=$!

trap 'kill $ADMIN_API_PID $ADMIN_WEB_PID $JAVA_PID 2>/dev/null || true' EXIT

echo "Admin API: http://localhost:$ADMIN_API_PORT/api"
echo "Admin Web: http://localhost:$ADMIN_WEB_PORT/admin/"
echo "Java Server: http://localhost:$SERVER_PORT"

wait
