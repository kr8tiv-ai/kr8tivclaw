import type { HarnessConfig } from '../compiler/schema.js';

export function renderAgentsMd(cfg: HarnessConfig): string {
  return `# AGENTS\n\nYou are ${cfg.name}, ${cfg.role}.\n\n## Job Functions\n${cfg.jobFunctions.map((f) => `- ${f}`).join('\n')}\n\n## Safety Boundaries\n${cfg.soul.boundaries.map((b) => `- ${b}`).join('\n') || '- Follow default OpenClaw safety model.'}\n`;
}

export function renderSoulMd(cfg: HarnessConfig): string {
  return `# SOUL\n\n## Core Truths\n${cfg.soul.truths.map((t) => `- ${t}`).join('\n')}\n\n## Voice\n${cfg.soul.voice}\n`;
}

export function renderToolsMd(cfg: HarnessConfig): string {
  return `# TOOLS\n\n## Allow\n${cfg.tooling.allow.map((t) => `- ${t}`).join('\n') || '- (none)'}\n\n## Deny\n${cfg.tooling.deny.map((t) => `- ${t}`).join('\n') || '- (none)'}\n\n## Elevated Mode\n- ${cfg.tooling.elevatedMode ? 'enabled' : 'disabled'}\n`;
}

export function renderUserMd(cfg: HarnessConfig): string {
  return `# USER\n\nTenant: ${cfg.tenantId}\nIdentity: ${cfg.name}\nRole: ${cfg.role}\nChannels: whatsapp=${cfg.channels.whatsapp}, telegram=${cfg.channels.telegram}\n`;
}

export function renderHeartbeatMd(cfg: HarnessConfig): string {
  return `# HEARTBEAT\n\n- watchdog_enabled: ${cfg.watchdog.enabled}\n- interval_seconds: ${cfg.watchdog.intervalSeconds}\n- updated_by: kr8tiv-claw harness compiler\n`;
}

export function renderMemoryMd(cfg: HarnessConfig): string | undefined {
  if (!cfg.memory.seed?.length) return undefined;
  return `# MEMORY\n\n${cfg.memory.seed.map((s) => `- ${s}`).join('\n')}\n`;
}

export function renderTasksMd(cfg: HarnessConfig): string {
  return `# TASKS\n\n## Tenant Provisioning\n- [ ] Create tenant workspace and state volumes for \`${cfg.tenantId}\`.\n- [ ] Set \`OPENCLAW_GATEWAY_TOKEN\` in secret manager / environment.\n- [ ] Generate workspace artifacts from harness.\n\n## Security Baseline\n- [ ] Confirm DM pairing: ${cfg.channels.dmPairingRequired ? 'enabled' : 'disabled'}.\n- [ ] Confirm mention gating: ${cfg.channels.mentionGating ? 'enabled' : 'disabled'}.\n- [ ] Review tool allow/deny lists before go-live.\n- [ ] Verify non-main session sandboxing is ${cfg.sandbox.nonMainSessionsIsolated ? 'enabled' : 'disabled'}.\n\n## Messaging Channels\n- [ ] Configure WhatsApp integration (${cfg.channels.whatsapp ? 'enabled in harness' : 'disabled in harness'}).\n- [ ] Configure Telegram integration (${cfg.channels.telegram ? 'enabled in harness' : 'disabled in harness'}).\n\n## Supermemory\n- [ ] Create scoped API key per tenant.\n- [ ] Validate containerTag: ${cfg.memory.supermemory.containerTag ?? '(not configured)'}.\n- [ ] Validate ingestion + retrieval smoke test.\n\n## Operations\n- [ ] Deploy compose stack and confirm healthcheck passes.\n- [ ] Configure watchdog webhook (${cfg.watchdog.enabled ? 'enabled' : 'disabled'}).\n- [ ] Add monitor alerting for 5+ minute downtime.\n- [ ] Verify backup policy for tenant state/workspace volumes.\n\n## Upstream Update Procedure\n- [ ] Track OpenClaw ${cfg.updateRing} ring updates.\n- [ ] Regenerate artifacts on update.\n- [ ] Re-run golden tests before rollout.\n`;
}

export function renderEnvExample(cfg: HarnessConfig): string {
  return `# Required\nOPENCLAW_GATEWAY_TOKEN=replace-with-strong-token\n\n# Optional Supermemory\nSUPERMEMORY_API_KEY=\nSUPERMEMORY_CONTAINER_TAG=${cfg.memory.supermemory.containerTag ?? cfg.tenantId}\n\n# Optional watchdog\nWATCHDOG_WEBHOOK_URL=${cfg.watchdog.webhookUrl ?? ''}\n`;
}
