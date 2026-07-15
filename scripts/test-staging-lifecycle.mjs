#!/usr/bin/env node

import { readFile } from 'node:fs/promises';

const origin = (process.env.STAGING_ORIGIN
  ?? 'https://cms-staging.optimaalgroeien.nl').replace(/\/$/, '');
const cookiePath = process.env.CF_ACCESS_COOKIE_FILE
  ?? '/tmp/og-cms-staging-e2e/cookies';

function assert(condition, message) {
  if (!condition) throw new Error(message);
  console.log(`PASS ${message}`);
}

async function readAccessCookie() {
  if (process.env.CF_ACCESS_COOKIE) return process.env.CF_ACCESS_COOKIE;

  const jar = await readFile(cookiePath, 'utf8');
  const cookies = [];

  for (const rawLine of jar.split('\n')) {
    if (!rawLine || (rawLine.startsWith('#') && !rawLine.startsWith('#HttpOnly_'))) continue;
    const line = rawLine.replace(/^#HttpOnly_/, '');
    const parts = line.split('\t');
    if (parts.length >= 7 && parts[0] === new URL(origin).hostname) {
      cookies.push(`${parts[5]}=${parts[6]}`);
    }
  }

  if (!cookies.length) {
    throw new Error(`Geen geldige Cloudflare Access-cookie gevonden in ${cookiePath}`);
  }

  return cookies.join('; ');
}

const cookie = await readAccessCookie();
const request = async (path, options = {}) => fetch(`${origin}${path}`, {
  redirect: 'manual',
  ...options,
  headers: {
    Cookie: cookie,
    ...(options.body ? {
      'Content-Type': 'application/json',
      'X-EmDash-Request': '1',
    } : {}),
    ...(['POST', 'PUT', 'PATCH', 'DELETE'].includes(options.method)
      ? { 'X-EmDash-Request': '1' }
      : {}),
    ...options.headers,
  },
});

const payload = {
  slug: 'cms-seo-test-20260715',
  status: 'draft',
  data: {
    title: 'CMS SEO test',
    excerpt: 'Publieke SEO controle op staging.',
    content: [
      {
        _type: 'block',
        _key: 'b1',
        style: 'h2',
        markDefs: [],
        children: [{
          _type: 'span',
          _key: 's1',
          text: 'SEO controle werkt',
          marks: [],
        }],
      },
      {
        _type: 'block',
        _key: 'b2',
        style: 'normal',
        markDefs: [],
        children: [{
          _type: 'span',
          _key: 's2',
          text: 'Deze tekst controleert veilig de openbare CMS metadata.',
          marks: [],
        }],
      },
    ],
  },
  seo: {
    title: 'SEO titel stagingtest | Optimaal Groeien',
    description: 'SEO beschrijving uit de CMS wordt openbaar gebruikt.',
    image: null,
    canonical: null,
    noIndex: true,
  },
};

let postId;

try {
  const initial = await request('/_emdash/api/content/posts');
  assert(initial.status === 200, 'inhoudslijst is bereikbaar');
  const initialBody = await initial.json();
  assert(initialBody?.data?.total === 0, 'staging begint zonder testartikelen');

  const collision = await request('/_emdash/api/content/posts', {
    method: 'POST',
    body: JSON.stringify({ ...payload, slug: 'ai-marketing' }),
  });
  const collisionText = await collision.text();
  assert(collision.status === 409, 'bestaande websiteslug wordt geblokkeerd met HTTP 409');
  assert(collisionText.includes('SLUG_ALREADY_USED'), 'slugblokkade geeft een duidelijke foutcode');

  const afterCollision = await request('/_emdash/api/content/posts');
  const afterCollisionBody = await afterCollision.json();
  assert(afterCollisionBody?.data?.total === 0, 'slugblokkade schrijft niets naar de CMS database');

  const create = await request('/_emdash/api/content/posts', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  assert(create.status === 201 || create.status === 200, 'tijdelijk SEO testartikel is aangemaakt');
  const created = await create.json();
  postId = created?.data?.item?.id;
  assert(typeof postId === 'string' && postId.length > 0, 'testartikel heeft een geldig ID');

  const publish = await request(`/_emdash/api/content/posts/${postId}/publish`, {
    method: 'POST',
    body: '{}',
  });
  assert(publish.status === 200, 'testartikel is gepubliceerd');

  const publicPage = await request(`/blog/${payload.slug}/`);
  assert(publicPage.status === 200, 'gepubliceerd CMS artikel staat openbaar op staging');
  const html = await publicPage.text();
  assert(html.includes('<title>SEO titel stagingtest | Optimaal Groeien</title>'), 'CMS SEO titel staat in de openbare HTML');
  assert(html.includes('content="SEO beschrijving uit de CMS wordt openbaar gebruikt."'), 'CMS SEO beschrijving staat in de openbare HTML');
  assert(html.includes('content="noindex, nofollow"'), 'noindex instelling staat in de openbare HTML');
  assert(html.includes('CMS SEO test') && html.includes('SEO controle werkt'), 'titel en artikeltekst zijn zichtbaar');

  const admin = await request('/_emdash/admin/');
  const adminHtml = await admin.text();
  assert(admin.status === 200 && adminHtml.includes('og-admin-help'), 'helpknop staat in de CMS beheeromgeving');

  const guide = await request('/_emdash/admin/handleiding/');
  const guideHtml = await guide.text();
  assert(guide.status === 200 && guideHtml.includes('Veilig content maken en publiceren'), 'B1 handleiding is bereikbaar');
  assert(guide.headers.get('cache-control')?.includes('no-store'), 'handleiding wordt niet gecachet');
  assert(guide.headers.get('x-robots-tag')?.includes('noindex'), 'handleiding wordt niet geïndexeerd');
} finally {
  if (postId) {
    const softDelete = await request(`/_emdash/api/content/posts/${postId}`, { method: 'DELETE' });
    assert(softDelete.status === 200, 'tijdelijk testartikel is naar de prullenbak verplaatst');

    const permanentDelete = await request(`/_emdash/api/content/posts/${postId}/permanent`, {
      method: 'DELETE',
    });
    assert(permanentDelete.status === 200, 'tijdelijk testartikel is definitief verwijderd');
  }
}

const finalList = await request('/_emdash/api/content/posts');
const finalBody = await finalList.json();
assert(finalBody?.data?.total === 0, 'staging is na de test weer leeg');

const removedPage = await request(`/blog/${payload.slug}/`);
assert(
  removedPage.status === 404
    || (removedPage.status === 302 && removedPage.headers.get('location') === '/404'),
  'verwijderd testartikel is niet meer openbaar',
);

console.log(`Staging lifecycle test passed: ${origin}`);
