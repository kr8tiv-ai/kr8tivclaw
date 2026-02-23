import type { HarnessConfig } from './schema.js';

/**
 * Produces a tenant-scoped docker compose template with optional watchdog sidecar.
 */
export function generateTenantCompose(cfg: HarnessConfig): string {
  const watchdogService = cfg.watchdog.enabled
    ? `
  agent-watchdog:
    image: curlimages/curl:8.10.1
    restart: unless-stopped
    environment:
      WATCHDOG_WEBHOOK_URL: ${cfg.watchdog.webhookUrl ?? ''}
      WATCHDOG_INTERVAL_SECONDS: "${cfg.watchdog.intervalSeconds}"
      TENANT_ID: ${cfg.tenantId}
    command: >-
      sh -c 'while true; do
        ts=$(date -u +%FT%TZ);
        curl -fsS -X POST "$WATCHDOG_WEBHOOK_URL" -H "content-type: application/json"
        -d "{\"tenantId\":\"$TENANT_ID\",\"timestamp\":\"$ts\",\"status\":\"alive\"}" || true;
        sleep "$WATCHDOG_INTERVAL_SECONDS";
      done'
    depends_on:
      openclaw-gateway:
        condition: service_healthy
`
    : '';

  return `version: "3.9"
services:
  openclaw-gateway:
    image: ${cfg.openclaw.image}
    container_name: openclaw-${cfg.tenantId}
    restart: unless-stopped
    environment:
      OPENCLAW_GATEWAY_TOKEN: \${OPENCLAW_GATEWAY_TOKEN}
      OPENCLAW_WORKSPACE: /workspace
    volumes:
      - tenant-${cfg.tenantId}-state:/state
      - tenant-${cfg.tenantId}-workspace:/workspace
    healthcheck:
      test: ["CMD-SHELL", "node dist/index.js health --token $OPENCLAW_GATEWAY_TOKEN"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 20s${watchdogService}

volumes:
  tenant-${cfg.tenantId}-state:
  tenant-${cfg.tenantId}-workspace:
`;
}
