#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "$0")" && pwd)"

# Defaults (can be overridden via environment)
: "${DB_USER:=code_editor}"
: "${DB_PASSWORD:=code_editor}"
: "${DB_NAME:=code_editor}"
: "${DB_PORT:=5432}"

echo "[start] Checking Docker availability..."
if ! docker info >/dev/null 2>&1; then
  echo "[error] Docker daemon is not running or not accessible. Please start Docker."
  exit 1
fi

compose_cmd="docker compose"
if ! docker compose version >/dev/null 2>&1; then
  if command -v docker-compose >/dev/null 2>&1; then
    compose_cmd="docker-compose"
  else
    echo "[error] Neither 'docker compose' nor 'docker-compose' is available."
    exit 1
  fi
fi

echo "[start] Bringing up PostgreSQL via docker-compose..."
${compose_cmd} -f "${PROJECT_ROOT}/docker-compose.yml" up -d postgres

echo "[start] Waiting for PostgreSQL healthcheck to pass..."
container_id=$(${compose_cmd} -f "${PROJECT_ROOT}/docker-compose.yml" ps -q postgres)
if [[ -z "${container_id}" ]]; then
  echo "[error] Unable to obtain postgres container id."
  exit 1
fi

max_wait=120
waited=0
while true; do
  status=$(docker inspect -f '{{.State.Health.Status}}' "${container_id}" 2>/dev/null || echo "unknown")
  if [[ "${status}" == "healthy" ]]; then
    echo "[start] PostgreSQL is healthy."
    break
  fi
  if (( waited >= max_wait )); then
    echo "[error] Timeout waiting for PostgreSQL to be healthy. Current status: ${status}"
    exit 1
  fi
  sleep 3
  waited=$((waited+3))
done

export DB_URL="jdbc:postgresql://localhost:${DB_PORT}/${DB_NAME}"
export DB_USER
export DB_PASSWORD
export STORAGE_TYPE=jpa
export WITH_DOCKER=true

echo "[start] Launching backend (Spring Boot) with database connection ${DB_URL}..."
cd "${PROJECT_ROOT}"
./gradlew bootRun