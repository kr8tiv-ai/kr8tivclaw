import { describe, expect, it, vi } from 'vitest';
import { SupermemoryClient } from '../src/supermemory/client.js';

describe('supermemory wrapper integration stubs (mock HTTP)', () => {
  it('sends tenant-scoped ingestion payload with customId dedupe conventions', async () => {
    const mockFetch = vi.fn(async () =>
      new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'content-type': 'application/json' } })
    );

    const client = new SupermemoryClient({ apiKey: 'scoped-key', containerTag: 'tenant-tag', fetchImpl: mockFetch as typeof fetch });
    await client.ingestDocument({ customId: 'doc:1', content: 'hello', metadata: { kind: 'note' } });

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const body = JSON.parse((mockFetch.mock.calls[0][1] as RequestInit).body as string);
    expect(body.containerTag).toBe('tenant-tag');
    expect(body.customId).toBe('doc:1');
    expect(body.metadata.dedupeBy).toBe('customId');
  });

  it('uses hybrid retrieval with threshold + user profile context fields', async () => {
    const mockFetch = vi.fn(async () =>
      new Response(JSON.stringify({ hits: [] }), { status: 200, headers: { 'content-type': 'application/json' } })
    );

    const client = new SupermemoryClient({ apiKey: 'scoped-key', containerTag: 'tenant-tag', fetchImpl: mockFetch as typeof fetch });
    await client.retrieve({ query: 'where is policy', threshold: 0.42, userId: 'u-1' });

    const body = JSON.parse((mockFetch.mock.calls[0][1] as RequestInit).body as string);
    expect(body.strategy).toBe('hybrid');
    expect(body.threshold).toBe(0.42);
    expect(body.userId).toBe('u-1');
  });
});
