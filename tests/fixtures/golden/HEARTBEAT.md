# HEARTBEAT

- watchdog_enabled: true
- interval_seconds: 60
- model_primary: anthropic/claude-opus-4-6
- fallback_triggers: rate_limit, provider_cooldown
- recovery_order: FRIDAY -> ARSENAL -> JOCASTA -> EDITH
- updated_by: kr8tiv-claw harness compiler

## Heartbeat Rules
- Do not leak secrets in heartbeat updates.
- Do not self-edit model routes or auth policy from heartbeat loops.
- If a peer is down, elect one recovery owner and avoid swarm recovery.
