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
