export interface HarnessTenant {
  id: string;
  name: string;
  containerTag: string;
  gatewayTokenEnv?: string;
}

export interface HarnessPersona {
  soul: string;
  agents: string;
  tools: string;
  user: string;
  heartbeat: string;
  memorySeed?: string;
}

export interface HarnessSecurity {
  pairingRequired: boolean;
  mentionGateInGroups: boolean;
  nonMainSessionSandbox: "strict" | "moderate";
  toolAllowList: string[];
  toolDenyList: string[];
}

export interface HarnessCompose {
  image: string;
  stateVolume: string;
  workspaceVolume: string;
  watchdog?: {
    enabled: boolean;
    webhookUrlEnv: string;
    intervalSeconds: number;
  };
}

export interface HarnessSupermemory {
  baseUrl: string;
  apiKeyEnv: string;
  defaultThreshold: number;
  minScore: number;
}

export interface HarnessConfig {
  tenant: HarnessTenant;
  persona: HarnessPersona;
  security: HarnessSecurity;
  compose: HarnessCompose;
  skills: string[];
  supermemory: HarnessSupermemory;
}
