# PostgreSQL Docker Setup for Java Code Editor

This repo includes a Dockerized PostgreSQL setup and a startup script to run the backend against the database with Spring Data JPA and HikariCP.

## Prerequisites
- Docker Desktop (or Docker Engine) installed and running
- Java 8+ toolchain (Gradle wrapper included)

## Environment Variables
You can override defaults via environment variables:

- `DB_USER` (default: `code_editor`)
- `DB_PASSWORD` (default: `code_editor`)
- `DB_NAME` (default: `code_editor`)
- `DB_PORT` (default: `5432`)
- `STORAGE_TYPE` (default: `memory`; set to `jpa` to use DB)

## Compose Services
`docker-compose.yml` provisions a `postgres` service using `postgres:16`:
- Persistent volume: `./postgres-data` → `/var/lib/postgresql/data`
- Migrations: mounts `./src/main/resources/db/migration` into `/docker-entrypoint-initdb.d` to initialize schema and seed data on first start
- Healthcheck uses `pg_isready`

## Start the Stack and Backend
Use the provided script to orchestrate startup:

```bash
chmod +x start.sh
./start.sh
```

This script:
- Verifies Docker is available
- Starts the `postgres` container in detached mode
- Waits for the healthcheck to pass
- Exports `DB_URL`, `DB_USER`, `DB_PASSWORD`, sets `STORAGE_TYPE=jpa`, and runs `./gradlew bootRun`

To stop containers:
```bash
docker compose down
```
or if using legacy binary:
```bash
docker-compose down
```

## Spring Configuration
Configuration is managed via `src/main/resources/application.yml`:

- Datasource (`spring.datasource.*`) with HikariCP pool settings
- Flyway migrations (`spring.flyway.*`) from `classpath:db/migration`
- JPA/Hibernate (`spring.jpa.*`), using PostgreSQL dialect
- Actuator endpoint exposure
- Storage selection (`storage.type`): `memory` or `jpa`

## Schema Overview
Tables initialized by migrations:
- `problems`: core problem metadata
- `test_cases`: sample test cases referencing `problems`
- `submissions`: simple submission records

Constraints and indexes:
- PK on `problems(id)`, PKs on `test_cases(id)` and `submissions(id)`
- FKs to `problems(id)` with `ON DELETE CASCADE`
- Indexes on `test_cases(problem_id)` and `submissions(problem_id)`

## Useful Commands
- Build tests: `./gradlew test`
- Build app: `./gradlew build`
- Run app locally without Docker: `STORAGE_TYPE=memory ./gradlew bootRun`
- Run Testcontainers-backed tests: `WITH_DOCKER=true ./gradlew test` (ensure Docker is running)

## Troubleshooting
- If the backend fails to connect, confirm the container is healthy: `docker compose ps`
- Verify env vars exported by `start.sh` (`DB_URL`, `DB_USER`, `DB_PASSWORD`, `STORAGE_TYPE`)
- Remove persistent data to reinitialize: `rm -rf postgres-data` (will recreate on next start)

## Output Comparison Modes
You can control how solution output is compared against expected output:

- `strict`: exact string match
- `lenient`: normalized outputs (handles newline/CRLF differences)
- `very_lenient`: normalized + trims and collapses extra whitespace

Configure defaults and per-problem overrides:

- Default mode in `application.yml`:
  - `compare.mode.default: lenient`
- Per-problem override via property (e.g., in `application.yml` or environment):
  - `compare.mode.p.<problemId>: strict`

Examples:

- Run with strict default: `./gradlew bootRun --args='--compare.mode.default=strict'`
- Override one problem: add `compare.mode.p.two-sum=strict` to `application.yml`