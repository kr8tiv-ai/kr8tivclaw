import type { HarnessConfig } from "../types.js";

export function buildOpenclawConfig(harness: HarnessConfig): string {
  const config = {
    tenant: {
      id: harness.tenant.id,
      name: harness.tenant.name,
      containerTag: harness.tenant.containerTag
    },
    security: {
      pairing: {
        required: harness.security.pairingRequired
      },
      mentionGating: {
        groups: harness.security.mentionGateInGroups
      },
      sessions: {
        nonMainSandbox: harness.security.nonMainSessionSandbox
      },
      tools: {
        allow: harness.security.toolAllowList,
        deny: harness.security.toolDenyList
      }
    },
    memory: {
      provider: "supermemory",
      containerTag: harness.tenant.containerTag
    }
  };

  return `${JSON.stringify(config, null, 2)}\n`;
}
