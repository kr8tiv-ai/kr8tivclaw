import path from 'node:path';
import { promises as fs } from 'node:fs';
import YAML from 'yaml';
import { parseHarness, type HarnessConfig } from './schema.js';
import {
  renderAgentsMd,
  renderHeartbeatMd,
  renderMemoryMd,
  renderSoulMd,
  renderToolsMd,
  renderUserMd
} from '../templates/workspace.js';

export type CompiledArtifact = { path: string; content: string };

export async function loadHarnessFromYaml(filePath: string): Promise<HarnessConfig> {
  const raw = await fs.readFile(filePath, 'utf8');
  const parsed = YAML.parse(raw);
  return parseHarness(parsed);
}

export function buildOpenClawConfig(cfg: HarnessConfig): Record<string, unknown> {
  return {
    tenantId: cfg.tenantId,
    updateRing: cfg.updateRing,
    security: {
      pairing: cfg.channels.dmPairingRequired,
      mentionGating: cfg.channels.mentionGating,
      sandboxNonMainSessions: cfg.sandbox.nonMainSessionsIsolated,
      toolAllowList: cfg.tooling.allow,
      toolDenyList: cfg.tooling.deny,
      elevatedMode: cfg.tooling.elevatedMode
    },
    channels: {
      whatsapp: cfg.channels.whatsapp,
      telegram: cfg.channels.telegram
    },
    memory: {
      retentionPolicy: cfg.memory.retentionPolicy,
      supermemory: cfg.memory.supermemory
    }
  };
}

export function buildSkillPackManifest(cfg: HarnessConfig): Record<string, unknown> {
  return {
    version: 1,
    installRoot: '<workspace>/skills',
    skills: cfg.skills.workspace.map((s) => ({
      source: s,
      destination: path.posix.join('<workspace>/skills', path.posix.basename(s))
    }))
  };
}

export function compileHarness(cfg: HarnessConfig): CompiledArtifact[] {
  const files: CompiledArtifact[] = [
    { path: 'AGENTS.md', content: renderAgentsMd(cfg) },
    { path: 'SOUL.md', content: renderSoulMd(cfg) },
    { path: 'TOOLS.md', content: renderToolsMd(cfg) },
    { path: 'USER.md', content: renderUserMd(cfg) },
    { path: 'HEARTBEAT.md', content: renderHeartbeatMd(cfg) },
    { path: 'openclaw.json', content: `${JSON.stringify(buildOpenClawConfig(cfg), null, 2)}\n` },
    { path: 'skill-pack.manifest.json', content: `${JSON.stringify(buildSkillPackManifest(cfg), null, 2)}\n` }
  ];

  const memory = renderMemoryMd(cfg);
  if (memory) files.push({ path: 'MEMORY.md', content: memory });

  return files;
}

export async function writeCompiledHarness(outputDir: string, artifacts: CompiledArtifact[]): Promise<void> {
  await fs.mkdir(outputDir, { recursive: true });
  await Promise.all(
    artifacts.map(async (artifact) => {
      const target = path.join(outputDir, artifact.path);
      await fs.mkdir(path.dirname(target), { recursive: true });
      await fs.writeFile(target, artifact.content, 'utf8');
    })
  );
}
