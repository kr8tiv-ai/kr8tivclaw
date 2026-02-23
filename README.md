# kr8tiv-claw distribution layer (for OpenClaw)

This repository provides a **thin distribution layer** around upstream OpenClaw with minimal divergence:

- Harness compiler CLI (TypeScript) that reads `harness.yaml`
- Workspace artifact generation (`AGENTS.md`, `SOUL.md`, `TOOLS.md`, `USER.md`, `HEARTBEAT.md`, optional `MEMORY.md`)
- `openclaw.json` generation with secure defaults (pairing, mention gating, sandboxing, allow/deny lists)
- Skill-pack manifest generation for workspace skills (`<workspace>/skills`)
- Per-tenant Docker Compose template generator with persistent volumes + healthcheck
- Optional `agent-watchdog` sidecar (simple webhook heartbeat pings)
- Supermemory integration wrapper with tenant-scoped key/containerTag conventions

## Module boundaries

- `src/compiler/schema.ts` – harness schema and validation
- `src/compiler/harness-compiler.ts` – compile harness into workspace/config artifacts
- `src/compiler/compose-generator.ts` – docker-compose template generation
- `src/templates/workspace.ts` – markdown template renderers
- `src/supermemory/client.ts` – Supermemory wrapper (ingest/retrieve/profile)
- `src/cli/harness.ts` – CLI entrypoint

## Quick start

```bash
npm install
npm run build
node dist/cli/harness.js --input ./tests/fixtures/harness.yaml --output ./out --compose-out ./out/docker-compose.yml
```

## Harness schema behavior

`harness.yaml` is validated by Zod before any files are generated.

Key secure defaults:

- `channels.dmPairingRequired: true`
- `channels.mentionGating: true`
- `sandbox.nonMainSessionsIsolated: true`
- explicit `tooling.allow` and `tooling.deny` support

## Tenant compose generation

Generated compose includes:

- `openclaw-gateway` container (upstream image configurable from harness)
- persistent tenant volumes (`tenant-<id>-state`, `tenant-<id>-workspace`)
- healthcheck command: `node dist/index.js health --token $OPENCLAW_GATEWAY_TOKEN`
- optional `agent-watchdog` sidecar (heartbeat webhook pings)

## Supermemory integration notes

`SupermemoryClient` is intentionally lightweight and container-friendly:

- Scoped API key expected per tenant
- `containerTag` required (tenant isolation boundary)
- Ingestion uses `customId` + metadata dedupe convention
- Retrieval uses `hybrid` strategy with configurable threshold
- `upsertUserProfile` supported using `profile:<userId>` customId format

## Testing

- `tests/harness-golden.test.ts` – golden-file output tests
- `tests/schema-validation.test.ts` – harness schema validation tests
- `tests/supermemory.integration.stub.test.ts` – mock HTTP integration stubs

Run:

```bash
npm test
```

## Upstream OpenClaw update strategy (minimal divergence)

1. Keep runtime behavior in upstream OpenClaw image whenever possible.
2. Keep kr8tiv features in templates/skills/config generation (this repo) rather than patching OpenClaw core.
3. Review upstream OpenClaw release notes, then:
   - bump default `openclaw.image` tag in harness examples/templates
   - regenerate tenant outputs from harnesses
   - run golden tests to detect accidental output drift
4. Only patch OpenClaw core if a hard blocker exists; prefer plugin/skill/template adaptation first.
