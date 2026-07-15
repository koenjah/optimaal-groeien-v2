#!/usr/bin/env node

const origin = (process.env.STAGING_ORIGIN
  ?? 'https://cms-staging.optimaalgroeien.nl').replace(/\/$/, '');
const accessCookie = process.env.CF_ACCESS_COOKIE ?? '';

if (!accessCookie) {
  let failed = false;

  for (const path of ['/', '/_emdash/admin/']) {
    const response = await fetch(`${origin}${path}`, { redirect: 'manual' });
    const location = response.headers.get('location') ?? '';
    const ok = response.status === 302
      && location.includes('cloudflareaccess.com/cdn-cgi/access/login');
    console.log(`${ok ? 'PASS' : 'FAIL'} ${response.status} ${path} Access ${ok ? 'active' : 'missing'}`);
    failed ||= !ok;
  }

  if (failed) process.exitCode = 1;
  else console.log('Staging is protected. Set CF_ACCESS_COOKIE to run authenticated checks.');
  process.exit();
}

const checks = [
  { path: '/', allowed: [200], contains: 'Optimaal Groeien' },
  { path: '/blog/', allowed: [200] },
  { path: '/sitemap-index.xml', allowed: [200], contains: '<sitemapindex' },
  { path: '/robots.txt', allowed: [200], contains: 'sitemap-index.xml' },
  { path: '/api/health', allowed: [200], contains: '"status":"ok"' },
  { path: '/_emdash/admin/', allowed: [200], contains: 'Optimaal Groeien CMS Admin' },
  { path: '/_emdash/admin/handleiding/', allowed: [200], contains: 'Veilig content maken en publiceren' },
  { path: '/_emdash/api/setup/status', allowed: [200], setupComplete: true },
  { path: '/_emdash/api/manifest', allowed: [200], json: true },
  { path: '/_emdash/api/taxonomies', allowed: [200], json: true },
  { path: '/_emdash/api/content/posts', allowed: [200], json: true },
  { path: '/_emdash/api/media', allowed: [200], json: true },
  { path: '/_emdash/api/admin/users', allowed: [200], json: true },
];

let failed = false;

for (const check of checks) {
  const response = await fetch(`${origin}${check.path}`, {
    redirect: 'manual',
    headers: { Cookie: accessCookie },
  });
  const ok = check.allowed.includes(response.status);
  let detail = '';

  if ((check.json || check.setupComplete) && response.ok) {
    try {
      const body = await response.json();
      detail = ` ${JSON.stringify(body)}`;
      if (check.setupComplete && body?.data?.needsSetup !== false) {
        failed = true;
        detail = ` setup is not complete: ${JSON.stringify(body)}`;
      }
    } catch {
      failed = true;
      detail = ' response was not valid JSON';
    }
  } else if (check.contains && response.ok) {
    const body = await response.text();
    if (!body.includes(check.contains)) {
      failed = true;
      detail = ` response did not contain ${JSON.stringify(check.contains)}`;
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
