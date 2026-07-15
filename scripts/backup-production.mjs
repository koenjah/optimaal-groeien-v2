#!/usr/bin/env node

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const accountId = 'c6b2726f6f179cede41f156972fd951a';
const target = process.argv.find((arg) => arg.startsWith('--target='))?.split('=')[1] ?? 'production';
if (!['production', 'staging'].includes(target)) throw new Error('Ongeldig back-updoel.');
const targetConfig = target === 'production'
  ? {
      databaseId: 'eb2e5e8a-12ce-4190-94ec-ee7644a5cbff',
      databaseName: 'optimaal-groeien-scans',
      workerName: 'optimaal-groeien',
    }
  : {
      databaseId: '1dc5542d-cc4e-4e98-a0bc-c2bbd0c22067',
      databaseName: 'optimaal-groeien-cms-staging',
      workerName: 'optimaal-groeien-emdash-staging',
    };
const { databaseId, databaseName, workerName } = targetConfig;
const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const backupRoot = '/Users/gebruiker/Documents/STEFAN/backups/optimaal-groeien';
const labelArg = process.argv.slice(2).find((arg) => !arg.startsWith('--')) ?? 'manual';
const label = labelArg.replace(/[^a-z0-9-]+/gi, '-').toLowerCase();
const timestamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
const outputDir = path.join(backupRoot, `${label}-${timestamp}`);

const token = process.env.CLOUDFLARE_API_TOKEN || process.env.CF_API_TOKEN;
const globalKey = process.env.CLOUDFLARE_API_KEY || process.env.CF_GLOBAL_API_KEY;
const email = process.env.CLOUDFLARE_EMAIL || process.env.CF_API_EMAIL;

function authHeaders() {
  if (token) return { Authorization: `Bearer ${token}` };
  if (globalKey && email) return { 'X-Auth-Key': globalKey, 'X-Auth-Email': email };
  throw new Error(
    'Geen Cloudflare-inlog gevonden. Gebruik CLOUDFLARE_API_TOKEN, of CLOUDFLARE_API_KEY en CLOUDFLARE_EMAIL.',
  );
}

async function apiJson(pathname, init = {}) {
  const response = await fetch(`https://api.cloudflare.com/client/v4${pathname}`, {
    ...init,
    headers: {
      ...authHeaders(),
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...(init.headers || {}),
    },
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok || payload?.success !== true) {
    const message = payload?.errors?.map((item) => item.message).join(', ') || `HTTP ${response.status}`;
    throw new Error(`Cloudflare API ${pathname}: ${message}`);
  }
  return payload.result;
}

async function saveJson(filename, pathname) {
  const result = await apiJson(pathname);
  fs.writeFileSync(path.join(outputDir, filename), `${JSON.stringify(result, null, 2)}\n`);
  return result;
}

async function queryD1(sql) {
  const result = await apiJson(`/accounts/${accountId}/d1/database/${databaseId}/query`, {
    method: 'POST',
    body: JSON.stringify({ sql }),
  });
  const statement = Array.isArray(result) ? result[0] : result;
  if (statement?.success === false) throw new Error(statement.error || 'D1 query failed');
  return statement?.results ?? [];
}

function quoteIdentifier(value) {
  return `"${String(value).replaceAll('"', '""')}"`;
}

function writeCommandOutput(filename, args) {
  const output = execFileSync('git', args, { cwd: projectRoot, encoding: 'utf8' });
  fs.writeFileSync(path.join(outputDir, filename), output);
}

function sha256(filename) {
  const data = fs.readFileSync(path.join(outputDir, filename));
  return crypto.createHash('sha256').update(data).digest('hex');
}

fs.mkdirSync(outputDir, { recursive: true });

await apiJson(`/accounts/${accountId}/d1/database/${databaseId}`);

const workerResponse = await fetch(
  `https://api.cloudflare.com/client/v4/accounts/${accountId}/workers/scripts/${workerName}`,
  { headers: authHeaders() },
);
if (!workerResponse.ok) throw new Error(`Worker-download mislukt: HTTP ${workerResponse.status}`);
fs.writeFileSync(
  path.join(outputDir, 'live-worker-script.multipart'),
  Buffer.from(await workerResponse.arrayBuffer()),
);
fs.writeFileSync(
  path.join(outputDir, 'live-worker-script.headers'),
  [...workerResponse.headers.entries()].map(([key, value]) => `${key}: ${value}`).join('\n') + '\n',
);

await Promise.all([
  saveJson('live-worker-settings.json', `/accounts/${accountId}/workers/scripts/${workerName}/settings`),
  saveJson('worker-deployments.json', `/accounts/${accountId}/workers/scripts/${workerName}/deployments`),
  saveJson('worker-versions.json', `/accounts/${accountId}/workers/scripts/${workerName}/versions`),
  saveJson('kv-namespaces.json', `/accounts/${accountId}/storage/kv/namespaces?per_page=100`),
  saveJson('r2-buckets.json', `/accounts/${accountId}/r2/buckets`),
]);

const tableRows = await queryD1(
  "SELECT name, type, sql FROM sqlite_master WHERE type IN ('table','view') AND name NOT LIKE 'sqlite_%' ORDER BY name",
);
const snapshot = {
  createdAt: new Date().toISOString(),
  accountId,
  databaseId,
  databaseName,
  tables: {},
  skipped: [],
};

for (const table of tableRows) {
  try {
    const rows = await queryD1(`SELECT * FROM ${quoteIdentifier(table.name)}`);
    snapshot.tables[table.name] = {
      type: table.type,
      schema: table.sql,
      rowCount: rows.length,
      rows,
    };
  } catch (error) {
    snapshot.skipped.push({
      name: table.name,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

const requiredTables = target === 'production'
  ? ['scan_entries', 'contact_submissions', 'users', '_emdash_collections', 'ec_posts', 'ec_pages', 'media']
  : ['users', '_emdash_collections', 'ec_posts', 'ec_pages', 'media'];

for (const requiredTable of requiredTables) {
  if (!snapshot.tables[requiredTable]) {
    throw new Error(`Kritieke tabel ontbreekt in de back-up: ${requiredTable}`);
  }
}

const logicalBackupName = `${databaseName}-logical.json`;
fs.writeFileSync(
  path.join(outputDir, logicalBackupName),
  `${JSON.stringify(snapshot, null, 2)}\n`,
);

writeCommandOutput('git-head.txt', ['rev-parse', 'HEAD']);
writeCommandOutput('git-status.txt', ['status', '--short', '--branch']);
writeCommandOutput('git-remotes.txt', ['remote', '-v']);
execFileSync('git', ['bundle', 'create', path.join(outputDir, 'optimaal-groeien-v2.bundle'), '--all'], {
  cwd: projectRoot,
  stdio: 'pipe',
});

const generatedWranglerPath = path.join(projectRoot, 'dist/server/wrangler.json');
if (fs.existsSync(generatedWranglerPath)) {
  const generatedWrangler = JSON.parse(fs.readFileSync(generatedWranglerPath, 'utf8'));
  if (generatedWrangler.name === workerName && generatedWrangler.account_id === accountId) {
    fs.copyFileSync(generatedWranglerPath, path.join(outputDir, `${target}-wrangler.json`));
  }
}

const files = fs.readdirSync(outputDir).filter((filename) => filename !== 'SHA256SUMS').sort();
fs.writeFileSync(
  path.join(outputDir, 'SHA256SUMS'),
  files.map((filename) => `${sha256(filename)}  ${filename}`).join('\n') + '\n',
);

const totalRows = Object.values(snapshot.tables).reduce((total, table) => total + table.rowCount, 0);
console.log(`Back-up gereed: ${outputDir}`);
console.log(`D1: ${Object.keys(snapshot.tables).length} tabellen, ${totalRows} rijen, ${snapshot.skipped.length} overgeslagen`);
console.log(`Checksums: ${files.length} bestanden`);
