# Auto-Improvement Control Plane (kr8tivclaw)

## Purpose

`kr8tivclaw` is the distribution/harness layer for OpenClaw tenants. This doc defines how we compile every tenant so runtime traffic is governed by a central Mission Control quality gate, instead of ad-hoc per-agent prompt edits.

## Product Positioning

We support two segments with the same architecture:

- **Individuals**: one user + one or few agents, privacy-preserving local/tenant-scoped learning
- **Enterprise**: many users + many agents, centralized policy with workspace/department scoping

Both segments should route through Mission Control (even single-agent installs) to gain:
- measurable quality
- controlled rollout/rollback
- ongoing prompt/context improvement

## Core Principle

No static prompts in production. Prompts and context packs are **versioned artifacts** with:
- champion/challenger states
- score history
- rollback pointer
- scope (`global`, `domain`, `agent`, `tenant`)

## Integration Contract with Mission Control

`kr8tivclaw` will compile tenant harnesses with these defaults:

1. `MISSION_CONTROL_REQUIRED=true`
2. `PROMPT_GATE_ENABLED=true`
3. `PROMPT_SCOPE=tenant`
4. `PRIVACY_MODE=tenant_isolated`
5. `AUTO_PROMPT_TRAINING=enabled`

The generated compose/openclaw config should include Mission Control endpoint/token wiring so runtime requests are auditable and scoreable.

## Prompt Pack Inheritance

At compile time, tenant artifacts should support layered prompt packs:

1. `global` (platform safety + universal quality rules)
2. `segment` (`individual` or `enterprise`)
3. `domain` (sales/support/ops/coding/etc.)
4. `agent` (optional specialization)
5. `tenant` (private adaptation)

Effective prompt/context = deterministic merge of these layers + version pin.

## Privacy + Learning Boundaries

- Tenant data never trains another tenant by default.
- Enterprise can opt into org-level sharing; individuals remain isolated.
- All optimization runs must consume redacted telemetry where possible.

## Phased Implementation

### Phase 1 — Documentation + contract (current)
- Define architecture and boundaries in README/docs
- Add harness schema fields for prompt gate toggles and privacy mode

### Phase 2 — Compiler support
- Extend `harness.yaml` schema for gate/prompt settings
- Generate `.env` and `openclaw.json` with Mission Control gate defaults
- Add golden tests for deterministic output

### Phase 3 — Runtime enforcement
- Reject/flag tenant configs that bypass Mission Control when gate is required
- Surface clear startup diagnostics for missing gate wiring

### Phase 4 — Continuous optimization hooks
- Emit standardized telemetry payloads for evaluator/optimizer workers
- Support champion prompt version pinning in compiled artifacts

## Non-Goals

- No vendor-locked external memory/RAG services.
- No global pooling of private tenant conversational data by default.

## Success Criteria

- Any new tenant can be deployed with quality gate enabled by default
- Prompt changes are versioned, measured, and reversible
- Individuals and enterprises share one system, with different policy scopes
