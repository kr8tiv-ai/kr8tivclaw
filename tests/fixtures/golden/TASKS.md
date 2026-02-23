# TASKS

## Tenant Provisioning
- [ ] Create tenant workspace and state volumes for `tenant-acme`.
- [ ] Set `OPENCLAW_GATEWAY_TOKEN` in secret manager / environment.
- [ ] Generate workspace artifacts from harness.

## Security Baseline
- [ ] Confirm DM pairing: enabled.
- [ ] Confirm mention gating: enabled.
- [ ] Review tool allow/deny lists before go-live.
- [ ] Verify non-main session sandboxing is enabled.

## Messaging Channels
- [ ] Configure WhatsApp integration (enabled in harness).
- [ ] Configure Telegram integration (enabled in harness).

## Supermemory
- [ ] Create scoped API key per tenant.
- [ ] Validate containerTag: tenant-acme.
- [ ] Validate ingestion + retrieval smoke test.

## Operations
- [ ] Deploy compose stack and confirm healthcheck passes.
- [ ] Configure watchdog webhook (enabled).
- [ ] Add monitor alerting for 5+ minute downtime.
- [ ] Verify backup policy for tenant state/workspace volumes.

## Upstream Update Procedure
- [ ] Track OpenClaw stable ring updates.
- [ ] Regenerate artifacts on update.
- [ ] Re-run golden tests before rollout.
