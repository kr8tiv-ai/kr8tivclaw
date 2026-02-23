#!/usr/bin/env node
import path from 'node:path';
import { promises as fs } from 'node:fs';
import YAML from 'yaml';
import { compileHarness, loadHarnessFromYaml, writeCompiledHarness } from '../compiler/harness-compiler.js';
import { generateTenantCompose } from '../compiler/compose-generator.js';
import { validateHarness } from '../compiler/schema.js';

function readFlag(name: string): string | undefined {
  const idx = process.argv.indexOf(name);
  if (idx === -1) return undefined;
  return process.argv[idx + 1];
}

function hasFlag(name: string): boolean {
  return process.argv.includes(name);
}

function printHelp(): void {
  // eslint-disable-next-line no-console
  console.log(`kr8tiv-claw harness CLI

Usage:
  node dist/cli/harness.js --input harness.yaml --output out --compose-out out/docker-compose.yml

Flags:
  --input <path>         Harness YAML input (default: harness.yaml)
  --output <dir>         Artifact output dir (default: out)
  --compose-out <path>   Compose output path (default: <output>/docker-compose.yml)
  --compose-only         Only generate compose output
  --validate-only        Validate harness and exit
  --help                 Show this help
`);
}

async function main(): Promise<void> {
  if (hasFlag('--help')) {
    printHelp();
    return;
  }

  const input = readFlag('--input') ?? 'harness.yaml';
  const output = readFlag('--output') ?? 'out';
  const composeOut = readFlag('--compose-out') ?? path.join(output, 'docker-compose.yml');

  if (hasFlag('--validate-only')) {
    const raw = await fs.readFile(input, 'utf8');
    const parsed = YAML.parse(raw);
    const validation = validateHarness(parsed);
    if (!validation.ok) {
      for (const error of validation.errors) {
        // eslint-disable-next-line no-console
        console.error(`- ${error}`);
      }
      process.exit(1);
    }
    // eslint-disable-next-line no-console
    console.log('Harness is valid.');
    return;
  }

  const cfg = await loadHarnessFromYaml(input);
  const compose = generateTenantCompose(cfg);

  if (!hasFlag('--compose-only')) {
    const artifacts = compileHarness(cfg);
    await writeCompiledHarness(output, artifacts);
    await fs.mkdir(path.dirname(composeOut), { recursive: true });
    await fs.writeFile(composeOut, compose, 'utf8');
    // eslint-disable-next-line no-console
    console.log(`Compiled ${artifacts.length + 1} files to ${output}`);
    return;
  }

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
