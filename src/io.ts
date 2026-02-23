import fs from "node:fs/promises";
import path from "node:path";
import YAML from "yaml";
import type { HarnessConfig } from "./types.js";
import { validateHarness } from "./schema/validator.js";

export async function readHarness(filePath: string): Promise<HarnessConfig> {
  const raw = await fs.readFile(filePath, "utf-8");
  const parsed = YAML.parse(raw);
  return validateHarness(parsed);
}

export async function writeFileSafe(baseDir: string, relativePath: string, content: string): Promise<void> {
  const outPath = path.join(baseDir, relativePath);
  await fs.mkdir(path.dirname(outPath), { recursive: true });
  await fs.writeFile(outPath, content, "utf-8");
}
