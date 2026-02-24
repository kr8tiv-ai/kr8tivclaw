# KR8TIV Claw - Challenges Backlog

Living backlog of platform-specific problems we want built into the KR8TIV distribution layer.

## P0 (active)

1. Sub-agent orchestration blocked by insecure gateway URL
   - Symptom: session/subagent RPC fails when gateway is `ws://` on non-loopback.
   - Need: compiler guard + generated checks that enforce `wss://` or localhost tunnel mode.

2. Rate-limit aware automation primitives
   - Symptom: repeated cron/task executions return `API rate limit reached`.
   - Need: default backoff policy templates + idempotent retry wrappers + cooldown metadata.

3. Arena task reliability hardening
   - Symptom: silent or partial failures when agents are unavailable or responses are delayed.
   - Need: participant preflight, bounded polling with backoff, explicit fail-fast behavior.

4. Model route lock + provider affinity
   - Symptom: runtime drift to non-approved model/provider routes.
   - Need: harness-level model policy, lock flags, and no-runtime-override defaults.

5. Single-owner recovery delegation
   - Symptom: multiple agents attempt the same recovery and collide.
   - Need: deterministic recovery order and one-owner recovery semantics in generated artifacts.

## P1

6. Mission Control task mode bootstrap in generated tenant artifacts
   - Add optional generated runbook + env scaffold for:
     - `ARENA_ALLOWED_AGENTS`
     - `ARENA_REVIEWER_AGENT`
     - `NOTEBOOKLM_RUNNER_CMD`
     - `NOTEBOOKLM_PROFILES_ROOT`
     - `NOTEBOOKLM_TIMEOUT_SECONDS`

7. Built-in ops health snapshot output
   - Add CLI command to generate a deterministic, redacted status report:
     - repo branch/dirty/ahead-behind
     - task mode readiness
     - watchdog/healthcheck readiness

8. PR cleanup automation for codex branch storms
   - Detect overlapping PR branches and classify as:
     - superseded
     - partially merged
     - not merged
   - Emit close/keep recommendation with file-level diff summary.

## P2

9. Windows-side workspace parity checker
   - Compare local WinSurf changes vs remote repo heads for active projects.

10. Template-level secret hygiene scanner
   - Detect accidental token/API key material in generated artifacts before write.

11. Artifact drift detector
   - Recompile from harness and report drift against committed golden fixtures.

---

## Operating rule

Every new production incident should add exactly one entry here with:
- symptom
- reproducible trigger
- desired deterministic guard
