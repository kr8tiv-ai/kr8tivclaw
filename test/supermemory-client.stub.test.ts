import { describe, expect, it, vi } from "vitest";
import { SupermemoryClient } from "../src/supermemory/client.js";

describe("SupermemoryClient integration stubs (mock HTTP)", () => {
  it("sends scoped ingestion payload with customId dedupe fields", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({ ok: true }) });

    const client = new SupermemoryClient({
      baseUrl: "https://api.supermemory.ai",
      apiKey: "test-key",
      containerTag: "tenant-a",
      fetchImpl: fetchMock as unknown as typeof fetch
    });

    await client.ingestDocuments([{ content: "hello", customId: "doc-1", metadata: { topic: "intro" } }]);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, req] = fetchMock.mock.calls[0];
    expect(url).toContain("/v3/documents");
    expect((req as RequestInit).body).toContain("doc-1");
    expect((req as RequestInit).body).toContain("tenant-a");
  });

  it("sends hybrid retrieval parameters with thresholds", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({ results: [] }) });

    const client = new SupermemoryClient({
      baseUrl: "https://api.supermemory.ai",
      apiKey: "test-key",
      containerTag: "tenant-a",
      defaultThreshold: 0.55,
      minScore: 0.4,
      fetchImpl: fetchMock as unknown as typeof fetch
    });

    await client.retrieve({ query: "status", userId: "u1" });

    const [, req] = fetchMock.mock.calls[0];
    expect((req as RequestInit).body).toContain('"mode":"hybrid"');
    expect((req as RequestInit).body).toContain('"threshold":0.55');
    expect((req as RequestInit).body).toContain('"minScore":0.4');
  });
});
