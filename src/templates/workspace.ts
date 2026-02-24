import type { HarnessConfig } from '../compiler/schema.js';

export function renderAgentsMd(cfg: HarnessConfig): string {
  return `# AGENTS\n\nYou are ${cfg.name}, ${cfg.role}.\n\n## Job Functions\n${cfg.jobFunctions.map((f) => `- ${f}`).join('\n')}\n\n## Safety Boundaries\n${cfg.soul.boundaries.map((b) => `- ${b}`).join('\n') || '- Follow default OpenClaw safety model.'}\n\n## Model Route Lock\n- primary: ${cfg.modelPolicy.primary}\n- fallbacks: ${cfg.modelPolicy.fallbacks.join(', ') || '(none)'}\n- lock_routes: ${cfg.modelPolicy.lockRoutes}\n- runtime_override_allowed: ${cfg.modelPolicy.allowRuntimeOverride}\n\n## Secrets Handling\n- Never write API keys, bot tokens, auth blobs, or OAuth data into workspace files, chat, or task comments.\n- Use runtime secret injection only (desktop/VPS secret manager or mounted secret files).\n\n## Operator Doctrine\n- "I can't" is not acceptable during execution.\n- If blocked, research alternatives and test them.\n- Before declaring impossible: evaluate at least 3 approaches, try at least 2, capture exact failures.\n- Deliver outcomes with evidence.\n\n## Recovery Delegation\n- Recovery order: ${cfg.recovery.teamOrder.join(' -> ')}\n- single_owner: ${cfg.recovery.singleOwner}\n- If you are not the elected owner for an outage, do not perform competing recovery actions.\n`;
}

export function renderSoulMd(cfg: HarnessConfig): string {
  return `# SOUL\n\n## Core Truths\n${cfg.soul.truths.map((t) => `- ${t}`).join('\n')}\n\n## Voice\n${cfg.soul.voice}\n`;
}

export function renderToolsMd(cfg: HarnessConfig): string {
  return `# TOOLS\n\n## Allow\n${cfg.tooling.allow.map((t) => `- ${t}`).join('\n') || '- (none)'}\n\n## Deny\n${cfg.tooling.deny.map((t) => `- ${t}`).join('\n') || '- (none)'}\n\n## Elevated Mode\n- ${cfg.tooling.elevatedMode ? 'enabled' : 'disabled'}\n`;
}

export function renderUserMd(cfg: HarnessConfig): string {
  return `# USER\n\nTenant: ${cfg.tenantId}\nIdentity: ${cfg.name}\nRole: ${cfg.role}\nChannels: whatsapp=${cfg.channels.whatsapp}, telegram=${cfg.channels.telegram}\nMissionControl: required=${cfg.missionControl.required}, prompt_gate=${cfg.missionControl.enforcePromptGate}, privacy_mode=${cfg.missionControl.privacyMode}\n`;
}

export function renderHeartbeatMd(cfg: HarnessConfig): string {
  return `# HEARTBEAT\n\n- watchdog_enabled: ${cfg.watchdog.enabled}\n- interval_seconds: ${cfg.watchdog.intervalSeconds}\n- model_primary: ${cfg.modelPolicy.primary}\n- fallback_triggers: ${cfg.modelPolicy.fallbackOn.join(', ')}\n- recovery_order: ${cfg.recovery.teamOrder.join(' -> ')}\n- updated_by: kr8tiv-claw harness compiler\n\n## Heartbeat Rules\n- Do not leak secrets in heartbeat updates.\n- Do not self-edit model routes or auth policy from heartbeat loops.\n- If a peer is down, elect one recovery owner and avoid swarm recovery.\n`;
}

export function renderMemoryMd(cfg: HarnessConfig): string | undefined {
  if (!cfg.memory.seed?.length) return undefined;
  return `# MEMORY\n\n${cfg.memory.seed.map((s) => `- ${s}`).join('\n')}\n`;
}

export function renderTasksMd(cfg: HarnessConfig): string {
  return `# TASKS

## Tenant Provisioning
- [ ] Create tenant workspace and state volumes for \`${cfg.tenantId}\`.
- [ ] Set \`OPENCLAW_GATEWAY_TOKEN\` in secret manager / secret file.
- [ ] Generate workspace artifacts from harness.

## Security Baseline
- [ ] Confirm DM pairing: ${cfg.channels.dmPairingRequired ? 'enabled' : 'disabled'}.
- [ ] Confirm mention gating: ${cfg.channels.mentionGating ? 'enabled' : 'disabled'}.
- [ ] Review tool allow/deny lists before go-live.
- [ ] Verify non-main session sandboxing is ${cfg.sandbox.nonMainSessionsIsolated ? 'enabled' : 'disabled'}.

## Mission Control Prompt Gate
- [ ] Mission Control required: ${cfg.missionControl.required ? 'yes' : 'no'}.
- [ ] Prompt gate enforcement: ${cfg.missionControl.enforcePromptGate ? 'enabled' : 'disabled'}.
- [ ] Privacy mode: ${cfg.missionControl.privacyMode}.
- [ ] Auto prompt training: ${cfg.missionControl.autoPromptTraining ? 'enabled' : 'disabled'}.

## Messaging Channels
- [ ] Configure WhatsApp integration (${cfg.channels.whatsapp ? 'enabled in harness' : 'disabled in harness'}).
- [ ] Configure Telegram integration (${cfg.channels.telegram ? 'enabled in harness' : 'disabled in harness'}).
- [ ] Ensure token injection uses runtime secret files, not committed env values.

## Model Policy
- [ ] Enforce primary model: ${cfg.modelPolicy.primary}
- [ ] Confirm fallback list: ${cfg.modelPolicy.fallbacks.join(', ') || '(none)'}
- [ ] Confirm runtime overrides are blocked: ${!cfg.modelPolicy.allowRuntimeOverride}
- [ ] Validate fallback triggers: ${cfg.modelPolicy.fallbackOn.join(', ')}

## Recovery Policy
- [ ] Confirm recovery order: ${cfg.recovery.teamOrder.join(' -> ')}
- [ ] Confirm single-owner recovery mode: ${cfg.recovery.singleOwner}
- [ ] Confirm recovery cooldown seconds: ${cfg.recovery.cooldownSeconds}

## Supermemory
- [ ] Create scoped API key per tenant.
- [ ] Validate containerTag: ${cfg.memory.supermemory.containerTag ?? '(not configured)'}.
- [ ] Validate ingestion + retrieval smoke test.

## Operations
- [ ] Deploy compose stack and confirm healthcheck passes.
- [ ] Configure watchdog webhook (${cfg.watchdog.enabled ? 'enabled' : 'disabled'}).
- [ ] Add monitor alerting for 5+ minute downtime.
- [ ] Verify backup policy for tenant state/workspace volumes.

## Upstream Update Procedure
- [ ] Track OpenClaw ${cfg.updateRing} ring updates.
- [ ] Regenerate artifacts on update.
- [ ] Re-run golden tests before rollout.
`;
}

export function renderEnvExample(cfg: HarnessConfig): string {
  return `# Required (inject at runtime, never commit real values)
OPENCLAW_GATEWAY_TOKEN_FILE=/run/secrets/openclaw_gateway_token
MISSION_CONTROL_REQUIRED=${cfg.missionControl.required}
MISSION_CONTROL_API_URL=${cfg.missionControl.apiUrl}
PROMPT_GATE_ENABLED=${cfg.missionControl.enforcePromptGate}
PROMPT_PRIVACY_MODE=${cfg.missionControl.privacyMode}
AUTO_PROMPT_TRAINING=${cfg.missionControl.autoPromptTraining}

# Optional model policy overrides (prefer harness defaults)
MODEL_PRIMARY=${cfg.modelPolicy.primary}
MODEL_FALLBACKS=${cfg.modelPolicy.fallbacks.join(',')}
MODEL_LOCK_ROUTES=${cfg.modelPolicy.lockRoutes}
MODEL_ALLOW_RUNTIME_OVERRIDE=${cfg.modelPolicy.allowRuntimeOverride}

# Optional Supermemory
SUPERMEMORY_API_KEY_FILE=/run/secrets/supermemory_api_key
SUPERMEMORY_CONTAINER_TAG=${cfg.memory.supermemory.containerTag ?? cfg.tenantId}

# Optional Telegram
TELEGRAM_BOT_TOKEN_FILE=/run/secrets/telegram_bot_token

# Optional watchdog
WATCHDOG_WEBHOOK_URL=${cfg.watchdog.webhookUrl ?? ''}
`;
}
