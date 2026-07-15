#!/usr/bin/env node

const origin = 'https://optimaalgroeien.nl';

const checks = [
  { path: '/', status: 200, contains: 'Optimaal Groeien' },
  { path: '/blog/', status: 200 },
  { path: '/onze-methode/', status: 200 },
  { path: '/over-ons/', status: 200 },
  { path: '/robots.txt', status: 200, contains: 'sitemap-index.xml' },
  { path: '/sitemap-index.xml', status: 200, contains: '<sitemapindex' },
  { path: '/api/health', status: 200, contains: '"status":"ok"' },
  { path: '/beheer/', status: 302, location: '/_emdash/admin/' },
  { path: '/_emdash/admin/handleiding/', status: 302, accessRedirect: true },
  { path: '/_emdash/handleiding/', status: 404 },
  { path: '/_emdash/admin/', status: 302, accessRedirect: true },
  { path: '/_emdash/api/manifest', status: 401 },
];

let failed = false;

for (const check of checks) {
  try {
    const response = await fetch(`${origin}${check.path}`, { redirect: 'manual' });
    let ok = response.status === check.status;
    let detail = '';

    if (check.location) {
      const location = response.headers.get('location') ?? '';
      ok &&= location === check.location;
      detail = ` location=${location || '(missing)'}`;
    }

    if (check.accessRedirect) {
      const location = response.headers.get('location') ?? '';
      ok &&= location.includes('cloudflareaccess.com/cdn-cgi/access/login');
      detail = ` access=${ok ? 'protected' : 'missing'}`;
    }

    if (check.contains && response.ok) {
      const body = await response.text();
      const contains = body.includes(check.contains);
      ok &&= contains;
      detail = ` contains=${contains ? 'yes' : 'no'}`;
    }

    console.log(`${ok ? 'PASS' : 'FAIL'} ${response.status} ${check.path}${detail}`);
    failed ||= !ok;
  } catch (error) {
    failed = true;
    console.log(`FAIL network ${check.path} ${error instanceof Error ? error.message : error}`);
  }
}

if (failed) {
  process.exitCode = 1;
} else {
  console.log(`Production smoke test passed: ${origin}`);
}
