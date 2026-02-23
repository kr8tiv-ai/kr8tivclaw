#!/usr/bin/env node
import path from 'node:path';
import { loadHarnessFromYaml, compileHarness, writeCompiledHarness } from '../compiler/harness-compiler.js';
import { generateTenantCompose } from '../compiler/compose-generator.js';

function readFlag(name: string): string | undefined {
  const idx = process.argv.indexOf(name);
  if (idx === -1) return undefined;
  return process.argv[idx + 1];
}

async function main(): Promise<void> {
  const input = readFlag('--input') ?? 'harness.yaml';
  const output = readFlag('--output') ?? 'out';
  const composeOut = readFlag('--compose-out') ?? path.join(output, 'docker-compose.yml');

  const cfg = await loadHarnessFromYaml(input);
  const artifacts = compileHarness(cfg);
  await writeCompiledHarness(output, artifacts);
  await writeCompiledHarness(path.dirname(composeOut), [
    { path: path.basename(composeOut), content: generateTenantCompose(cfg) }
  ]);

  // eslint-disable-next-line no-console
  console.log(`Compiled ${artifacts.length + 1} files to ${output}`);
}

main().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error);
  process.exit(1);
});
