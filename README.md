# kr8tiv-claw distribution layer (for OpenClaw)

A thin, upstream-friendly distribution layer that compiles tenant harnesses into OpenClaw-ready workspace and config artifacts.

## Goals

- Keep minimal upstream divergence from OpenClaw runtime.
- Put KR8TIV-specific behavior in compiler/templates/modules, not core forks.
- Make mass tenant deployment deterministic and repeatable.
- Keep generated artifacts secret-safe by design (runtime injection, no key commits).

## Features

- Harness compiler CLI (`harness.yaml` -> generated artifacts + rollout tasks)
- Workspace artifact generation:
  - `AGENTS.md`, `SOUL.md`, `TOOLS.md`, `USER.md`, `HEARTBEAT.md`, `TASKS.md`, `.env.example`, optional `MEMORY.md`
- `openclaw.json` generation with secure defaults:
  - DM pairing and mention gating
  - non-main session sandboxing
  - tool allow/deny policy controls
  - model route lock and fallback trigger policy
  - deterministic single-owner recovery order
- Skill-pack manifest generation for `<workspace>/skills`
- Per-tenant docker-compose template generator:
  - OpenClaw gateway container
  - tenant state/workspace volumes
  - healthcheck command: `node dist/index.js health --token $OPENCLAW_GATEWAY_TOKEN`
  - optional `agent-watchdog` sidecar webhook pings
- Supermemory integration module:
  - scoped API key + containerTag model
  - ingestion with `customId` dedupe conventions
  - hybrid retrieval + threshold clamping
  - user profile upsert support

## Module boundaries

- `src/compiler/schema.ts` - harness schema + validation rules
- `src/compiler/harness-compiler.ts` - compile/write config + workspace artifacts
- `src/compiler/compose-generator.ts` - compose template output
- `src/templates/workspace.ts` - markdown rendering templates
- `src/supermemory/client.ts` - tenant-scoped Supermemory wrapper
- `src/cli/harness.ts` - CLI entrypoint

## CLI usage

```bash
npm install
npm run build

# compile all artifacts + compose
node dist/cli/harness.js --input ./harness.yaml --output ./out --compose-out ./out/docker-compose.yml

# compose only
node dist/cli/harness.js --input ./harness.yaml --compose-only --compose-out ./out/docker-compose.yml

# validate only
node dist/cli/harness.js --input ./harness.yaml --validate

# print JSON schema shape
node dist/cli/harness.js --schema
```

## Supermemory conventions

- each tenant gets a scoped key and a distinct `containerTag`
- ingestion metadata includes:
  - `source: kr8tiv-claw`
  - `dedupeBy: customId`
- user profile customId convention:
  - `profile:<userId>`

## Tests

- golden outputs: `tests/harness-golden.test.ts`
- schema validation: `tests/schema-validation.test.ts`
- Supermemory integration stubs (mock HTTP): `tests/supermemory.integration.stub.test.ts`

Run:

```bash
npm test
```

## KR8TIV-specific challenge backlog

- See `docs/CHALLENGES-BACKLOG.md` for platform gaps we are actively baking into the distribution layer.

## Team-wide Auto-Improvement Strategy (New)

We are standardizing `kr8tivclaw` so every tenant (individual or enterprise) can be compiled with a Mission Control quality gate and iterative prompt/context optimization.

- Architecture + policy doc: [`docs/AUTO-IMPROVEMENT-CONTROL-PLANE.md`](docs/AUTO-IMPROVEMENT-CONTROL-PLANE.md)
- Preserved strategy verdict + source set: [`docs/EVOLUTION-VERDICT-2026-02-24.md`](docs/EVOLUTION-VERDICT-2026-02-24.md)
- Principle: no unmanaged static prompts in production
- Default direction: route runtime through Mission Control so quality is measured, prompts are versioned, and rollbacks are deterministic

## Upstream-safe update workflow

1. Track upstream OpenClaw image tags (stable/beta/dev).
2. Keep custom behavior in this distribution layer.
3. Recompile tenant outputs from harness files after upstream bumps.
4. Run golden tests to verify deterministic output and drift.
5. Review generated `TASKS.md` for rollout gates and owner sign-off.
6. Promote compose/environment changes tenant-by-tenant.
7. Only patch OpenClaw core if blocked by an upstream gap.
