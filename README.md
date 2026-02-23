# kr8tiv-claw distribution layer (for openclaw)

This repository provides a **thin distribution layer** around upstream openclaw.
It focuses on reproducible tenant packaging while minimizing divergence from core runtime code.

## What this includes

- Harness compiler CLI (`TypeScript`) for `harness.yaml`.
- Secure-default `openclaw.json` generation.
- Workspace prompt-file generation:
  - `AGENTS.md`
  - `SOUL.md`
  - `TOOLS.md`
  - `USER.md`
  - `HEARTBEAT.md`
  - `MEMORY.md` (optional seed)
- Skill-pack manifest generation to install workspace skills into `<workspace>/skills`.
- Per-tenant docker-compose template generator:
  - openclaw gateway service
  - persistent volumes for state/workspace
  - healthcheck command using upstream-style health CLI
  - optional `agent-watchdog` sidecar for lightweight heartbeat pings
- Supermemory integration wrapper with:
  - scoped per-tenant API key usage
  - ingestion with `customId` dedupe conventions
  - hybrid retrieval with thresholds and profile upserts
- Tests:
  - golden-file output tests
  - schema validation tests
  - integration-test stubs for Supermemory wrapper using mock HTTP

---

## Install / build

```bash
npm install
npm run build
```

## Harness schema

Use `test/fixtures/harness.yaml` as a reference.
Validation is performed with JSON Schema (`src/schema/harness.schema.json`).

## Generate a tenant instance

```bash
# Compile harness into workspace + config artifacts
node dist/cli.js compile --input ./harness.yaml --out-dir ./out/tenant-acme

# Generate docker-compose template for that tenant
node dist/cli.js compose --input ./harness.yaml --output ./out/tenant-acme/docker-compose.yml
```

Generated output directory:

- `openclaw.json`
- `skill-pack.manifest.json`
- `workspace/*` (prompt files)
- `docker-compose.yml` (when using compose command)

## Updating upstream openclaw safely

To reduce merge burden:

1. Keep this repo focused on templates, compiler logic, and adapters.
2. Avoid modifying openclaw runtime internals unless absolutely required.
3. Pin openclaw gateway image tags per release ring (`stable`/`beta`) in `harness.yaml`.
4. Re-run golden tests after pulling upstream image/config expectations.
5. If new upstream options appear, map them into harness schema + generators, not ad-hoc manual files.

## Supermemory module boundaries

- `src/supermemory/client.ts` is the only API wrapper.
- It enforces container-tag scoping per tenant.
- `ingestDocuments` uses `customId` for idempotent updates/dedupe behavior.
- `retrieve` uses hybrid mode and configurable threshold/minScore values.
- `upsertUserProfile` writes structured user profile docs as memory records.

## Running tests

```bash
npm test
```
