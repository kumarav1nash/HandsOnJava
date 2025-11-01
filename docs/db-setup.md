# PostgreSQL Integration: Setup, Migrations, and Operations

## Connection & Credentials
- Env vars (recommended):
  - `DB_URL` (e.g., `jdbc:postgresql://localhost:5432/code_editor`)
  - `DB_USER` (e.g., `code_editor`)
  - `DB_PASSWORD`
  - `DB_POOL_MAX` / `DB_POOL_MIN`
- Storage selection:
  - `STORAGE_TYPE=jpa` to enable DB-backed repository (Hibernate/JPA)
  - Default is `memory` for backward compatibility

## Schema Migrations (Flyway)
- Migrations are located at `classpath:db/migration`.
- On startup, Flyway applies pending migrations automatically.
- Initial schema and seed data are defined in `V1__init.sql`.

## Tables
- `problems`: core problem metadata
- `test_cases`: sample test cases per problem (`is_sample` flag retained)
- `submissions`: simple submission records

## Indexes & Constraints
- Primary keys on `problems.id` and `test_cases.id`/`submissions.id`.
- Foreign keys from `test_cases` and `submissions` to `problems(id)` with `ON DELETE CASCADE`.
- Add additional indexes per workload if needed (e.g., `test_cases(problem_id)`).

## Pooling (Hikari)
- Tunables in `application.properties` via env vars:
  - `spring.datasource.hikari.maximum-pool-size` (default 10)
  - `spring.datasource.hikari.minimum-idle` (default 2)
  - `spring.datasource.hikari.connection-timeout` (default 30s)
  - `spring.datasource.hikari.idle-timeout` (default 30s)

## Transaction Handling
- Persistence is implemented using Spring Data JPA (Hibernate).
- Write operations are annotated with `@Transactional` in the JPA adapter/service.
- Reads use Spring Data repositories and entity mappings (`@Entity`).

## Backup & Recovery
- Backup: `pg_dump -Fc -d code_editor -h <host> -U <user> -f backup.dump`
- Restore: `pg_restore -d code_editor -h <host> -U <user> backup.dump`
- Simple SQL backup: `pg_dump -d code_editor > backup.sql` and restore with `psql -d code_editor -f backup.sql`.

## Monitoring
- Spring Boot Actuator provides `health` and `metrics` endpoints:
  - Enable via `management.endpoints.web.exposure.include=health,metrics`
  - Integrate with Prometheus/Grafana if desired (add Prometheus registry and scrape actuator metrics).
- Hikari pool metrics are exposed via Micrometer.

## Deployment Notes
- Provision PostgreSQL with sufficient `shared_buffers`, `work_mem`, and `max_connections` per expected load.
- Ensure connections over TLS in production; manage credentials via secrets.
- Apply migrations during deployment (app startup or CI step running Flyway).

## Connection Strings
- Local: `jdbc:postgresql://localhost:5432/code_editor`
- Docker: `jdbc:postgresql://postgres:5432/code_editor`
- Cloud: `jdbc:postgresql://<host>:5432/<db>?sslmode=require`

## Switching Storage
- Default: memory (`STORAGE_TYPE=memory`)
- Enable DB: set `STORAGE_TYPE=jpa` and provide `DB_URL`, `DB_USER`, `DB_PASSWORD`.