#!/usr/bin/env node
import path from "node:path";
import { readHarness, writeFileSafe } from "./io.js";
import { compileHarness } from "./compiler/harnessCompiler.js";
import { buildComposeTemplate } from "./templates/compose.js";

function parseArg(flag: string): string | undefined {
  const i = process.argv.indexOf(flag);
  return i > -1 ? process.argv[i + 1] : undefined;
}

async function main(): Promise<void> {
  const command = process.argv[2];

  if (!command || ["-h", "--help"].includes(command)) {
    process.stdout.write(
      "kr8tiv-claw commands:\n  compile --input harness.yaml --out-dir ./out\n  compose --input harness.yaml --output ./docker-compose.tenant.yml\n"
    );
    return;
  }

  const input = parseArg("--input");
  if (!input) throw new Error("--input is required");

  const harness = await readHarness(input);

  if (command === "compile") {
    const outDir = parseArg("--out-dir") ?? "./dist-output";
    await compileHarness(harness, outDir);
    process.stdout.write(`Compiled harness to ${path.resolve(outDir)}\n`);
    return;
  }

  if (command === "compose") {
    const output = parseArg("--output") ?? "./docker-compose.tenant.yml";
    await writeFileSafe(".", output, buildComposeTemplate(harness));
    process.stdout.write(`Generated compose template at ${path.resolve(output)}\n`);
    return;
  }

  throw new Error(`Unknown command: ${command}`);
}

main().catch((err: unknown) => {
  process.stderr.write(`${err instanceof Error ? err.message : String(err)}\n`);
  process.exit(1);
});
