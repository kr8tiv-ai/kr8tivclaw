import { z } from 'zod';

/**
 * 15-point harness schema that compiles to OpenClaw workspace/config artifacts.
 * Keep this as the single source of truth for distribution-level behavior.
 */
export const HarnessSchema = z
  .object({
    tenantId: z.string().min(1).regex(/^[a-z0-9][a-z0-9-]*$/, 'tenantId must be kebab-case safe'),
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
    missionControl: z
      .object({
        required: z.boolean().default(true),
        apiUrl: z.string().url().default('http://mission-control:8000/api/v1'),
        enforcePromptGate: z.boolean().default(true),
        privacyMode: z.enum(['tenant_isolated', 'org_shared']).default('tenant_isolated'),
        autoPromptTraining: z.boolean().default(true)
      })
      .default({}),
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
      .default({ image: 'ghcr.io/openclaw/openclaw:latest' }),
    modelPolicy: z
      .object({
        primary: z.string().min(1).default('openai-codex/gpt-5.3-codex'),
        fallbacks: z.array(z.string().min(1)).default([]),
        lockRoutes: z.boolean().default(true),
        allowRuntimeOverride: z.boolean().default(false),
        fallbackOn: z
          .array(
            z.enum(['rate_limit', 'provider_cooldown', 'billing_disabled', 'auth_profile_unavailable'])
          )
          .default(['rate_limit', 'provider_cooldown', 'billing_disabled', 'auth_profile_unavailable'])
      })
      .default({
        primary: 'openai-codex/gpt-5.3-codex',
        fallbacks: [],
        lockRoutes: true,
        allowRuntimeOverride: false,
        fallbackOn: ['rate_limit', 'provider_cooldown', 'billing_disabled', 'auth_profile_unavailable']
      }),
    recovery: z
      .object({
        teamOrder: z
          .array(z.enum(['FRIDAY', 'ARSENAL', 'JOCASTA', 'EDITH']))
          .default(['FRIDAY', 'ARSENAL', 'JOCASTA', 'EDITH']),
        singleOwner: z.boolean().default(true),
        cooldownSeconds: z.number().int().min(30).default(300)
      })
      .default({
        teamOrder: ['FRIDAY', 'ARSENAL', 'JOCASTA', 'EDITH'],
        singleOwner: true,
        cooldownSeconds: 300
      })
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

    const allow = new Set(data.tooling.allow);
    const overlap = data.tooling.deny.filter((entry) => allow.has(entry));
    if (overlap.length > 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['tooling'],
        message: `tooling.allow and tooling.deny overlap: ${overlap.join(', ')}`
      });
    }

    if (data.memory.supermemory.containerTag && !/^[a-z0-9][a-z0-9-]*$/.test(data.memory.supermemory.containerTag)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['memory', 'supermemory', 'containerTag'],
        message: 'containerTag must be kebab-case safe'
      });
    }

    if (!data.recovery.teamOrder.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['recovery', 'teamOrder'],
        message: 'recovery.teamOrder must include at least one agent'
      });
    }

    const recoveryOrder = new Set(data.recovery.teamOrder);
    if (recoveryOrder.size !== data.recovery.teamOrder.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['recovery', 'teamOrder'],
        message: 'recovery.teamOrder must not contain duplicates'
      });
    }
  });

export type HarnessConfig = z.infer<typeof HarnessSchema>;

export function parseHarness(raw: unknown): HarnessConfig {
  return HarnessSchema.parse(raw);
}

export function getHarnessJsonShape(): Record<string, unknown> {
  return {
    type: 'object',
    required: ['tenantId', 'name', 'role', 'soul', 'jobFunctions'],
    properties: {
      tenantId: { type: 'string', pattern: '^[a-z0-9][a-z0-9-]*$' },
      name: { type: 'string' },
      role: { type: 'string' },
      soul: {
        type: 'object',
        required: ['truths', 'voice'],
        properties: {
          truths: { type: 'array', items: { type: 'string' }, minItems: 1 },
          voice: { type: 'string' },
          boundaries: { type: 'array', items: { type: 'string' } }
        }
      },
      jobFunctions: { type: 'array', items: { type: 'string' }, minItems: 1 },
      missionControl: {
        type: 'object',
        properties: {
          required: { type: 'boolean' },
          apiUrl: { type: 'string', format: 'uri' },
          enforcePromptGate: { type: 'boolean' },
          privacyMode: { type: 'string', enum: ['tenant_isolated', 'org_shared'] },
          autoPromptTraining: { type: 'boolean' }
        }
      },
      modelPolicy: {
        type: 'object',
        properties: {
          primary: { type: 'string' },
          fallbacks: { type: 'array', items: { type: 'string' } },
          lockRoutes: { type: 'boolean' },
          allowRuntimeOverride: { type: 'boolean' },
          fallbackOn: { type: 'array', items: { type: 'string' } }
        }
      },
      recovery: {
        type: 'object',
        properties: {
          teamOrder: { type: 'array', items: { type: 'string' } },
          singleOwner: { type: 'boolean' },
          cooldownSeconds: { type: 'number' }
        }
      }
    }
  };
}
