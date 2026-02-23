import { z } from 'zod';

/**
 * 15-point harness schema that compiles to OpenClaw workspace/config artifacts.
 * Keep this as the single source of truth for distribution-level behavior.
 */
export const HarnessSchema = z
  .object({
    tenantId: z.string().min(1),
    name: z.string().min(1),
    role: z.string().min(1),
    soul: z.object({
      truths: z.array(z.string().min(1)).min(1),
      voice: z.string().min(1),
      boundaries: z.array(z.string().min(1)).default([])
    }),
    jobFunctions: z.array(z.string().min(1)).min(1),
    channels: z
      .object({
        whatsapp: z.boolean().default(false),
        telegram: z.boolean().default(false),
        dmPairingRequired: z.boolean().default(true),
        mentionGating: z.boolean().default(true)
      })
      .default({}),
    tooling: z
      .object({
        allow: z.array(z.string().min(1)).default([]),
        deny: z.array(z.string().min(1)).default([]),
        elevatedMode: z.boolean().default(false)
      })
      .default({}),
    sandbox: z
      .object({
        nonMainSessionsIsolated: z.boolean().default(true)
      })
      .default({}),
    memory: z
      .object({
        seed: z.array(z.string().min(1)).optional(),
        retentionPolicy: z.string().min(1).default('local-first'),
        supermemory: z
          .object({
            enabled: z.boolean().default(false),
            containerTag: z.string().min(1).optional()
          })
          .default({ enabled: false })
      })
      .default({}),
    updateRing: z.enum(['stable', 'beta', 'dev']).default('stable'),
    watchdog: z
      .object({
        enabled: z.boolean().default(false),
        webhookUrl: z.string().url().optional(),
        intervalSeconds: z.number().int().min(30).default(60)
      })
      .default({ enabled: false, intervalSeconds: 60 }),
    skills: z
      .object({
        workspace: z.array(z.string().min(1)).default([])
      })
      .default({ workspace: [] }),
    openclaw: z
      .object({
        image: z.string().min(1).default('ghcr.io/openclaw/openclaw:latest')
      })
      .default({ image: 'ghcr.io/openclaw/openclaw:latest' })
  })
  .superRefine((data, ctx) => {
    if (data.watchdog.enabled && !data.watchdog.webhookUrl) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['watchdog', 'webhookUrl'],
        message: 'watchdog.webhookUrl is required when watchdog.enabled is true'
      });
    }

    if (data.memory.supermemory.enabled && !data.memory.supermemory.containerTag) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['memory', 'supermemory', 'containerTag'],
        message: 'memory.supermemory.containerTag is required when supermemory is enabled'
      });
    }
  });

export type HarnessConfig = z.infer<typeof HarnessSchema>;

export function parseHarness(raw: unknown): HarnessConfig {
  return HarnessSchema.parse(raw);
}
