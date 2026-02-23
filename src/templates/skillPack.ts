import type { HarnessConfig } from "../types.js";

export function buildSkillPackManifest(harness: HarnessConfig): string {
  const manifest = {
    version: 1,
    installPath: "./skills",
    skills: harness.skills.map((id) => ({ id, source: "workspace" }))
  };

  return `${JSON.stringify(manifest, null, 2)}\n`;
}
