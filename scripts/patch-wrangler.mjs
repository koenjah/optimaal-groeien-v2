#!/usr/bin/env node
// Patches dist/server/wrangler.json with correct Worker name + D1 binding.
// Astro's Cloudflare adapter regenerates the config on each build, so this
// runs after `npm run build` and before `wrangler deploy`.

import fs from 'node:fs';

const path = new URL('../dist/server/wrangler.json', import.meta.url);
const cfg = JSON.parse(fs.readFileSync(path, 'utf8'));

cfg.name = 'optimaal-groeien';
cfg.kv_namespaces = [];
cfg.d1_databases = [
  {
    binding: 'DB',
    database_name: 'optimaal-groeien-scans',
    database_id: 'eb2e5e8a-12ce-4190-94ec-ee7644a5cbff',
  },
];
if (cfg.previews) {
  cfg.previews.kv_namespaces = [];
  cfg.previews.d1_databases = cfg.d1_databases;
}

fs.writeFileSync(path, JSON.stringify(cfg, null, 2));
console.log('✓ Patched dist/server/wrangler.json with D1 binding');
