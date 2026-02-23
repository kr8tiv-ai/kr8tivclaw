import path from "node:path";
import type { HarnessConfig } from "../types.js";
import { writeFileSafe } from "../io.js";
import { buildOpenclawConfig } from "../templates/openclawConfig.js";
import { buildSkillPackManifest } from "../templates/skillPack.js";

export async function compileHarness(harness: HarnessConfig, outputDir: string): Promise<void> {
  const workspaceDir = path.join(outputDir, "workspace");

  await writeFileSafe(workspaceDir, "AGENTS.md", `${harness.persona.agents}\n`);
  await writeFileSafe(workspaceDir, "SOUL.md", `${harness.persona.soul}\n`);
  await writeFileSafe(workspaceDir, "TOOLS.md", `${harness.persona.tools}\n`);
  await writeFileSafe(workspaceDir, "USER.md", `${harness.persona.user}\n`);
  await writeFileSafe(workspaceDir, "HEARTBEAT.md", `${harness.persona.heartbeat}\n`);

  if (harness.persona.memorySeed?.trim()) {
    await writeFileSafe(workspaceDir, "MEMORY.md", `${harness.persona.memorySeed}\n`);
  }

  await writeFileSafe(outputDir, "openclaw.json", buildOpenclawConfig(harness));
  await writeFileSafe(outputDir, "skill-pack.manifest.json", buildSkillPackManifest(harness));
}
