import type { HarnessConfig } from "../types.js";

function watchdogService(harness: HarnessConfig): string {
  const watchdog = harness.compose.watchdog;
  if (!watchdog?.enabled) return "";

  return `\n  agent-watchdog:\n    image: curlimages/curl:8.11.1\n    restart: unless-stopped\n    environment:\n      WATCHDOG_WEBHOOK: \${${watchdog.webhookUrlEnv}}\n      WATCHDOG_INTERVAL: ${watchdog.intervalSeconds}\n      TENANT_ID: ${harness.tenant.id}\n    command: >-\n      sh -lc 'while true; do\n        ts=$(date -u +"%Y-%m-%dT%H:%M:%SZ");\n        payload="{\\"tenantId\\":\\"$TENANT_ID\\",\\"timestamp\\":\\"$ts\\",\\"status\\":\\"alive\\"}";\n        curl -sS -X POST -H "content-type: application/json" -d "$payload" "$WATCHDOG_WEBHOOK" || true;\n        sleep "$WATCHDOG_INTERVAL";\n      done'\n`;
}

export function buildComposeTemplate(harness: HarnessConfig): string {
  const gatewayTokenEnv = harness.tenant.gatewayTokenEnv ?? "OPENCLAW_GATEWAY_TOKEN";

  return `version: "3.9"\nservices:\n  openclaw-gateway:\n    image: ${harness.compose.image}\n    restart: unless-stopped\n    environment:\n      OPENCLAW_GATEWAY_TOKEN: \${${gatewayTokenEnv}}\n      OPENCLAW_TENANT_ID: ${harness.tenant.id}\n      OPENCLAW_CONTAINER_TAG: ${harness.tenant.containerTag}\n      SUPERMEMORY_API_KEY: \${${harness.supermemory.apiKeyEnv}}\n    volumes:\n      - ${harness.compose.stateVolume}:/var/lib/openclaw\n      - ${harness.compose.workspaceVolume}:/workspace\n    healthcheck:\n      test: ["CMD-SHELL", "node dist/index.js health --token $$OPENCLAW_GATEWAY_TOKEN"]\n      interval: 30s\n      timeout: 10s\n      retries: 3\n      start_period: 30s${watchdogService(harness)}\n`;
}
