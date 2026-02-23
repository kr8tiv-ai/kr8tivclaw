import { describe, expect, it } from 'vitest';
import { parseHarness } from '../src/compiler/schema.js';

describe('harness schema validation', () => {
  it('accepts minimal valid config', () => {
    const parsed = parseHarness({
      tenantId: 't1',
      name: 'Agent',
      role: 'Role',
      soul: { truths: ['truth'], voice: 'voice' },
      jobFunctions: ['do thing']
    });

    expect(parsed.channels.dmPairingRequired).toBe(true);
    expect(parsed.sandbox.nonMainSessionsIsolated).toBe(true);
  });

  it('rejects invalid watchdog URL when enabled', () => {
    expect(() =>
      parseHarness({
        tenantId: 't1',
        name: 'Agent',
        role: 'Role',
        soul: { truths: ['truth'], voice: 'voice' },
        jobFunctions: ['do thing'],
        watchdog: { enabled: true, webhookUrl: 'not-a-url', intervalSeconds: 60 }
      })
    ).toThrowError();
  });

  it('rejects missing watchdog URL when enabled', () => {
    expect(() =>
      parseHarness({
        tenantId: 't1',
        name: 'Agent',
        role: 'Role',
        soul: { truths: ['truth'], voice: 'voice' },
        jobFunctions: ['do thing'],
        watchdog: { enabled: true, intervalSeconds: 60 }
      })
    ).toThrowError(/watchdog.webhookUrl/);
  });

  it('rejects supermemory enabled without containerTag', () => {
    expect(() =>
      parseHarness({
        tenantId: 't1',
        name: 'Agent',
        role: 'Role',
        soul: { truths: ['truth'], voice: 'voice' },
        jobFunctions: ['do thing'],
        memory: { supermemory: { enabled: true } }
      })
    ).toThrowError(/containerTag/);
  });

  it('rejects tool allow/deny overlap', () => {
    expect(() =>
      parseHarness({
        tenantId: 't1',
        name: 'Agent',
        role: 'Role',
        soul: { truths: ['truth'], voice: 'voice' },
        jobFunctions: ['do thing'],
        tooling: { allow: ['shell.exec'], deny: ['shell.exec'] }
      })
    ).toThrowError(/overlap/);
  });

  it('rejects unsafe tenant/container tags', () => {
    expect(() =>
      parseHarness({
        tenantId: 'Bad Tenant',
        name: 'Agent',
        role: 'Role',
        soul: { truths: ['truth'], voice: 'voice' },
        jobFunctions: ['do thing']
      })
    ).toThrowError(/kebab-case/);

    expect(() =>
      parseHarness({
        tenantId: 'good-tenant',
        name: 'Agent',
        role: 'Role',
        soul: { truths: ['truth'], voice: 'voice' },
        jobFunctions: ['do thing'],
        memory: { supermemory: { enabled: true, containerTag: 'Bad Tag' } }
      })
    ).toThrowError(/kebab-case/);
  });
});
