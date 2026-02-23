export type SupermemoryClientOptions = {
  baseUrl?: string;
  apiKey: string;
  containerTag: string;
  fetchImpl?: typeof fetch;
};

export type IngestDocumentInput = {
  customId: string;
  content: string;
  metadata?: Record<string, unknown>;
};

export type RetrieveInput = {
  query: string;
  threshold?: number;
  limit?: number;
  metadata?: Record<string, unknown>;
  userId?: string;
};

/**
 * Lightweight wrapper designed for tenant-scoped usage via containerTag + scoped API keys.
 */
export class SupermemoryClient {
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly containerTag: string;
  private readonly fetchImpl: typeof fetch;

  constructor(opts: SupermemoryClientOptions) {
    this.baseUrl = opts.baseUrl ?? 'https://api.supermemory.ai';
    this.apiKey = opts.apiKey;
    this.containerTag = opts.containerTag;
    this.fetchImpl = opts.fetchImpl ?? fetch;
  }

  async ingestDocument(input: IngestDocumentInput): Promise<unknown> {
    return this.request('/v3/documents', {
      method: 'POST',
      body: JSON.stringify({
        content: input.content,
        customId: input.customId,
        containerTag: this.containerTag,
        metadata: {
          ...input.metadata,
          source: 'kr8tiv-claw',
          dedupeBy: 'customId'
        }
      })
    });
  }

  async retrieve(input: RetrieveInput): Promise<unknown> {
    return this.request('/v4/search', {
      method: 'POST',
      body: JSON.stringify({
        q: input.query,
        containerTag: this.containerTag,
        strategy: 'hybrid',
        threshold: input.threshold ?? 0.35,
        limit: input.limit ?? 8,
        metadata: input.metadata,
        userId: input.userId
      })
    });
  }

  async upsertUserProfile(userId: string, profile: Record<string, unknown>): Promise<unknown> {
    return this.request('/v3/documents', {
      method: 'POST',
      body: JSON.stringify({
        content: JSON.stringify(profile),
        customId: `profile:${userId}`,
        containerTag: this.containerTag,
        metadata: {
          kind: 'user-profile',
          userId,
          source: 'kr8tiv-claw'
        }
      })
    });
  }

  private async request(path: string, init: RequestInit): Promise<unknown> {
    const response = await this.fetchImpl(`${this.baseUrl}${path}`, {
      ...init,
      headers: {
        authorization: `Bearer ${this.apiKey}`,
        'content-type': 'application/json',
        ...(init.headers ?? {})
      }
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Supermemory API error ${response.status}: ${body}`);
    }
    return response.json();
  }
}
