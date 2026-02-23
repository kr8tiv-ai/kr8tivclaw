import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { readHarness } from "../src/io.js";
import { compileHarness } from "../src/compiler/harnessCompiler.js";
import { buildComposeTemplate } from "../src/templates/compose.js";

async function readGolden(name: string): Promise<string> {
  return fs.readFile(path.join("test/golden", name), "utf-8");
}

describe("harness compiler", () => {
  it("matches golden output for generated files", async () => {
    const harness = await readHarness("test/fixtures/harness.yaml");
    const outDir = await fs.mkdtemp(path.join(os.tmpdir(), "kr8tiv-claw-"));

    await compileHarness(harness, outDir);

    await expect(fs.readFile(path.join(outDir, "openclaw.json"), "utf-8")).resolves.toBe(await readGolden("openclaw.json"));
    await expect(fs.readFile(path.join(outDir, "skill-pack.manifest.json"), "utf-8")).resolves.toBe(
      await readGolden("skill-pack.manifest.json")
    );
    await expect(fs.readFile(path.join(outDir, "workspace", "MEMORY.md"), "utf-8")).resolves.toContain(
      "Acme onboarding complete"
    );
  });

  it("matches golden compose template", async () => {
    const harness = await readHarness("test/fixtures/harness.yaml");
    expect(buildComposeTemplate(harness)).toBe(await readGolden("compose.yml"));
  });
});
