#!/usr/bin/env node
import path from 'node:path';
import { promises as fs } from 'node:fs';
import { loadHarnessFromYaml, compileHarness, writeCompiledHarness } from '../compiler/harness-compiler.js';
import { generateTenantCompose } from '../compiler/compose-generator.js';

function readFlag(name: string): string | undefined {
  const idx = process.argv.indexOf(name);
  if (idx === -1) return undefined;
  return process.argv[idx + 1];
}

function hasFlag(name: string): boolean {
  return process.argv.includes(name);
}

function command(): 'compile' | 'compose' {
  if (hasFlag('--compose-only')) return 'compose';
  return 'compile';
}

async function main(): Promise<void> {
  const input = readFlag('--input') ?? 'harness.yaml';
  const output = readFlag('--output') ?? 'out';
  const composeOut = readFlag('--compose-out') ?? path.join(output, 'docker-compose.yml');

  const cfg = await loadHarnessFromYaml(input);

  if (command() === 'compile') {
    const artifacts = compileHarness(cfg);
    await writeCompiledHarness(output, artifacts);

    const compose = generateTenantCompose(cfg);
    await fs.mkdir(path.dirname(composeOut), { recursive: true });
    await fs.writeFile(composeOut, compose, 'utf8');

    // eslint-disable-next-line no-console
    console.log(`Compiled ${artifacts.length + 1} files to ${output}`);
    return;
  }

  const compose = generateTenantCompose(cfg);
  await fs.mkdir(path.dirname(composeOut), { recursive: true });
  await fs.writeFile(composeOut, compose, 'utf8');
  // eslint-disable-next-line no-console
  console.log(`Generated compose file at ${composeOut}`);
}

main().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error);
  process.exit(1);
});
