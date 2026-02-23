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
});
