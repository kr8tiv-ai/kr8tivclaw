export interface SupermemoryDocument {
  content: string;
  customId: string;
  metadata?: Record<string, unknown>;
}

export interface SupermemorySearchOptions {
  query: string;
  userId?: string;
  topK?: number;
  threshold?: number;
  minScore?: number;
  metadataFilter?: Record<string, unknown>;
}

export interface SupermemoryClientOptions {
  baseUrl: string;
  apiKey: string;
  containerTag: string;
  defaultThreshold?: number;
  minScore?: number;
  fetchImpl?: typeof fetch;
}

/**
 * Supermemory wrapper designed for per-tenant scoped API keys + containerTag isolation.
 */
export class SupermemoryClient {
  private readonly fetchImpl: typeof fetch;

  constructor(private readonly opts: SupermemoryClientOptions) {
    this.fetchImpl = opts.fetchImpl ?? fetch;
  }

  async ingestDocuments(documents: SupermemoryDocument[]): Promise<void> {
    const payload = {
      containerTags: [this.opts.containerTag],
      // customId is used for idempotent upserts and dedupe.
      documents: documents.map((d) => ({
        text: d.content,
        customId: d.customId,
        metadata: {
          ...d.metadata,
          containerTag: this.opts.containerTag,
          source: "kr8tiv-claw"
        }
      }))
    };

    await this.request("/v3/documents", payload);
  }

  async retrieve(options: SupermemorySearchOptions): Promise<unknown> {
    const payload = {
      query: options.query,
      containerTags: [this.opts.containerTag],
      mode: "hybrid",
      topK: options.topK ?? 8,
      threshold: options.threshold ?? this.opts.defaultThreshold ?? 0.5,
      minScore: options.minScore ?? this.opts.minScore ?? 0.35,
      userId: options.userId,
      metadataFilter: options.metadataFilter
    };

    return this.request("/v4/search", payload);
  }

  async upsertUserProfile(userId: string, profile: Record<string, unknown>): Promise<void> {
    await this.ingestDocuments([
      {
        content: JSON.stringify(profile),
        customId: `user-profile:${userId}`,
        metadata: {
          type: "user-profile",
          userId
        }
      }
    ]);
  }

  private async request(path: string, payload: unknown): Promise<unknown> {
    const res = await this.fetchImpl(`${this.opts.baseUrl}${path}`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${this.opts.apiKey}`,
        "content-type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      throw new Error(`Supermemory request failed (${res.status}) for ${path}`);
    }

    if (res.status === 204) return undefined;
    return res.json();
  }
}
