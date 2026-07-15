#!/usr/bin/env node

import { readFile } from 'node:fs/promises';

const origin = (process.env.STAGING_ORIGIN
  ?? 'https://cms-staging.optimaalgroeien.nl').replace(/\/$/, '');
const cookiePath = process.env.CF_ACCESS_COOKIE_FILE
  ?? '/tmp/og-cms-staging-e2e/cookies';
const endpoint = '/_emdash/api/plugins/og-tracking/settings';

function assert(condition, message) {
  if (!condition) throw new Error(message);
  console.log(`PASS ${message}`);
}

async function readAccessCookie() {
  if (process.env.CF_ACCESS_COOKIE) return process.env.CF_ACCESS_COOKIE;

  const jar = await readFile(cookiePath, 'utf8');
  const hostname = new URL(origin).hostname;
  const cookies = [];

  for (const rawLine of jar.split('\n')) {
    if (!rawLine || (rawLine.startsWith('#') && !rawLine.startsWith('#HttpOnly_'))) continue;
    const parts = rawLine.replace(/^#HttpOnly_/, '').split('\t');
    if (parts.length >= 7 && parts[0] === hostname) cookies.push(`${parts[5]}=${parts[6]}`);
  }

  if (!cookies.length) throw new Error(`Geen geldige Cloudflare Access-cookie gevonden in ${cookiePath}`);
  return cookies.join('; ');
}

const cookie = await readAccessCookie();
const request = (path, options = {}) => fetch(`${origin}${path}`, {
  redirect: 'manual',
  ...options,
  headers: {
    Cookie: cookie,
    ...(['PUT', 'POST', 'PATCH', 'DELETE'].includes(options.method)
      ? { 'Content-Type': 'application/json', 'X-EmDash-Request': '1' }
      : {}),
    ...options.headers,
  },
});

const initialResponse = await request(endpoint);
assert(initialResponse.status === 200, 'trackinginstellingen zijn bereikbaar voor een ingelogde beheerder');
const initialBody = await initialResponse.json();
const initial = initialBody?.data;
assert(initial && typeof initial.enabled === 'boolean', 'trackinginstellingen hebben een geldig antwoord');

try {
  const invalid = await request(endpoint, {
    method: 'PUT',
    body: JSON.stringify({ enabled: true, type: 'gtm', id: 'fout' }),
  });
  const invalidText = await invalid.text();
  assert(invalid.status === 400, 'een ongeldig Google-ID wordt geblokkeerd');
  assert(invalidText.includes('geldig Tag Manager-ID'), 'de validatiefout is duidelijk');

  const saveGtm = await request(endpoint, {
    method: 'PUT',
    body: JSON.stringify({ enabled: true, type: 'gtm', id: 'GTM-TEST123' }),
  });
  assert(saveGtm.status === 200, 'een geldig Tag Manager-ID kan worden opgeslagen');

  const gtmPage = await request('/?tracking-test=gtm');
  const gtmHtml = await gtmPage.text();
  assert(gtmPage.status === 200, 'de stagingwebsite blijft bereikbaar met Tag Manager');
  assert(gtmHtml.includes('data-og-google-tracking="gtm"'), 'Tag Manager staat in de head');
  assert(gtmHtml.includes('ns.html?id=GTM-TEST123'), 'Tag Manager fallback staat direct na de body');

  const saveGoogleTag = await request(endpoint, {
    method: 'PUT',
    body: JSON.stringify({ enabled: true, type: 'google-tag', id: 'G-TEST12345' }),
  });
  assert(saveGoogleTag.status === 200, 'een geldig Google tag-ID kan worden opgeslagen');

  const googleTagPage = await request('/?tracking-test=google-tag');
  const googleTagHtml = await googleTagPage.text();
  assert(googleTagPage.status === 200, 'de stagingwebsite blijft bereikbaar met Google tag');
  assert(googleTagHtml.includes('gtag/js?id=G-TEST12345'), 'de Google tag-bibliotheek wordt geladen');
  assert(googleTagHtml.includes(`gtag('config',"G-TEST12345")`), 'de Google tag wordt ingesteld');
  assert(!googleTagHtml.includes('ns.html?id=GTM-TEST123'), 'de oude Tag Manager-code wordt niet meer geladen');
} finally {
  const restore = await request(endpoint, {
    method: 'PUT',
    body: JSON.stringify(initial),
  });
  assert(restore.status === 200, 'de oorspronkelijke staginginstellingen zijn hersteld');
}

const finalResponse = await request(endpoint);
const finalBody = await finalResponse.json();
assert(
  JSON.stringify(finalBody?.data) === JSON.stringify(initial),
  'staging bevat na de test exact dezelfde trackinginstellingen als ervoor',
);

console.log(`Staging tracking test passed: ${origin}`);
