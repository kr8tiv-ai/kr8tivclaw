import { z } from 'zod';

/**
 * Declarative 15-point harness schema for tenant-specific workspace generation.
 * Designed to map into OpenClaw prompt/workspace conventions with minimal core divergence.
 */
export const HarnessSchema = z.object({
  tenantId: z.string().min(1),
  name: z.string().min(1),
  role: z.string().min(1),
  soul: z.object({
    truths: z.array(z.string().min(1)).min(1),
    voice: z.string().min(1),
    boundaries: z.array(z.string().min(1)).default([])
  }),
  jobFunctions: z.array(z.string().min(1)).min(1),
  channels: z.object({
    whatsapp: z.boolean().default(false),
    telegram: z.boolean().default(false),
    dmPairingRequired: z.boolean().default(true),
    mentionGating: z.boolean().default(true)
  }),
  tooling: z.object({
    allow: z.array(z.string().min(1)).default([]),
    deny: z.array(z.string().min(1)).default([]),
    elevatedMode: z.boolean().default(false)
  }),
  sandbox: z.object({
    nonMainSessionsIsolated: z.boolean().default(true)
  }),
  memory: z.object({
    seed: z.array(z.string().min(1)).optional(),
    retentionPolicy: z.string().min(1).default('local-first'),
    supermemory: z.object({
      enabled: z.boolean().default(false),
      containerTag: z.string().min(1).optional()
    }).default({ enabled: false })
  }),
  updateRing: z.enum(['stable', 'beta', 'dev']).default('stable'),
  watchdog: z.object({
    enabled: z.boolean().default(false),
    webhookUrl: z.string().url().optional(),
    intervalSeconds: z.number().int().min(30).default(60)
  }).default({ enabled: false, intervalSeconds: 60 }),
  skills: z.object({
    workspace: z.array(z.string().min(1)).default([])
  }).default({ workspace: [] }),
  openclaw: z.object({
    image: z.string().min(1).default('ghcr.io/openclaw/openclaw:latest')
  }).default({ image: 'ghcr.io/openclaw/openclaw:latest' })
});

export type HarnessConfig = z.infer<typeof HarnessSchema>;

export function parseHarness(raw: unknown): HarnessConfig {
  return HarnessSchema.parse(raw);
}
