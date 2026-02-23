import { describe, expect, it } from "vitest";
import { validateHarness } from "../src/schema/validator.js";

describe("harness schema", () => {
  it("accepts a valid harness shape", () => {
    const valid = {
      tenant: { id: "t1", name: "Team One", containerTag: "tag1" },
      persona: {
        soul: "soul",
        agents: "agents",
        tools: "tools",
        user: "user",
        heartbeat: "heartbeat"
      },
      security: {
        pairingRequired: true,
        mentionGateInGroups: true,
        nonMainSessionSandbox: "strict",
        toolAllowList: ["files.read"],
        toolDenyList: ["shell.exec"]
      },
      compose: {
        image: "ghcr.io/openclaw/openclaw:latest",
        stateVolume: "state",
        workspaceVolume: "ws"
      },
      skills: ["workspace/safety"],
      supermemory: {
        baseUrl: "https://api.supermemory.ai",
        apiKeyEnv: "SUPERMEMORY_API_KEY",
        defaultThreshold: 0.5,
        minScore: 0.3
      }
    };

    expect(validateHarness(valid)).toEqual(valid);
  });

  it("rejects invalid harness shape", () => {
    expect(() =>
      validateHarness({
        tenant: { id: "t1", name: "Team One", containerTag: "tag1" }
      })
    ).toThrow(/Invalid harness.yaml/);
  });
});
