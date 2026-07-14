#!/usr/bin/env node

const origin = (process.env.STAGING_ORIGIN
  ?? 'https://optimaal-groeien-emdash-staging.koenjah.workers.dev').replace(/\/$/, '');

const checks = [
  { path: '/_emdash/admin/setup', allowed: [200] },
  { path: '/_emdash/api/setup/status', allowed: [200], json: true },
  { path: '/_emdash/api/manifest', allowed: [401] },
  { path: '/_emdash/api/taxonomies', allowed: [401] },
  { path: '/_emdash/api/content/posts', allowed: [401] },
  { path: '/_emdash/api/media', allowed: [401] },
];

let failed = false;

for (const check of checks) {
  const response = await fetch(`${origin}${check.path}`, { redirect: 'manual' });
  const ok = check.allowed.includes(response.status);
  let detail = '';

  if (check.json && response.ok) {
    try {
      const body = await response.json();
      detail = ` ${JSON.stringify(body)}`;
    } catch {
      failed = true;
      detail = ' response was not valid JSON';
    }
  }

  console.log(`${ok ? 'PASS' : 'FAIL'} ${response.status} ${check.path}${detail}`);
  failed ||= !ok;
}

if (failed) {
  process.exitCode = 1;
} else {
  console.log(`EmDash staging smoke test passed: ${origin}`);
}
