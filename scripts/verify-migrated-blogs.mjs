#!/usr/bin/env node

import { readFile, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';
import rehypeParse from 'rehype-parse';
import { unified } from 'unified';

const args = process.argv.slice(2);
const target = args.find((arg) => arg.startsWith('--target='))?.split('=')[1] ?? 'staging';
if (!['staging', 'production'].includes(target)) throw new Error('Ongeldig doel.');

const settings = target === 'production'
  ? { origin: 'https://optimaalgroeien.nl', cookieFile: '/tmp/og-cms-production-e2e/cookies' }
  : { origin: 'https://cms-staging.optimaalgroeien.nl', cookieFile: '/tmp/og-cms-staging-e2e/cookies' };
const blogDirectory = fileURLToPath(new URL('../src/content/blog/', import.meta.url));

function normalize(value) {
  return String(value ?? '')
    .normalize('NFKC')
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

function textContent(node) {
  if (!node) return '';
  if (node.type === 'text') return node.value ?? '';
  return Array.isArray(node.children) ? node.children.map(textContent).join(' ') : '';
}

function metaDescription(node) {
  if (!node) return '';
  if (node.type === 'element' && node.tagName === 'meta'
    && node.properties?.name === 'description') {
    return String(node.properties?.content ?? '');
  }
  for (const child of node.children ?? []) {
    const value = metaDescription(child);
    if (value) return value;
  }
  return '';
}

async function cookieFromJar(path, hostname) {
  const jar = await readFile(path, 'utf8');
  return jar.split('\n').flatMap((rawLine) => {
    if (!rawLine || (rawLine.startsWith('#') && !rawLine.startsWith('#HttpOnly_'))) return [];
    const parts = rawLine.replace(/^#HttpOnly_/, '').split('\t');
    return parts.length >= 7 && (parts[0] === hostname || parts[0] === `.${hostname}`)
      ? [`${parts[5]}=${parts[6]}`]
      : [];
  }).join('; ');
}

const cookie = await cookieFromJar(settings.cookieFile, new URL(settings.origin).hostname);
if (!cookie) throw new Error(`Geen geldige Access-cookie voor ${target}.`);
const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
const get = async (path, authenticated = false) => {
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    try {
      const response = await fetch(`${settings.origin}${path}`, {
        redirect: 'manual',
        headers: authenticated || target === 'staging' ? { Cookie: cookie } : {},
      });
      if (attempt < 4 && (response.status === 429 || response.status >= 500)) {
        await response.body?.cancel();
        await wait(attempt * 1000);
        continue;
      }
      return response;
    } catch (error) {
      if (attempt === 4) throw error;
      await wait(attempt * 1000);
    }
  }
  throw new Error(`GET ${path} bleef mislukken`);
};

const files = (await readdir(blogDirectory)).filter((name) => name.endsWith('.md')).sort();
const expected = new Map();
for (const filename of files) {
  const source = await readFile(`${blogDirectory}/${filename}`, 'utf8');
  const match = source.match(/^---\s*\n([\s\S]*?)\n---/);
  const data = yaml.load(match?.[1] ?? '');
  expected.set(String(data.slug), data);
}

const listResponse = await get('/_emdash/api/content/posts?limit=100', true);
if (listResponse.status !== 200) throw new Error(`CMS lijst gaf HTTP ${listResponse.status}`);
const listBody = await listResponse.json();
const items = listBody?.data?.items ?? [];
if (listBody?.data?.total !== expected.size || items.length !== expected.size) {
  throw new Error(`CMS bevat ${listBody?.data?.total ?? items.length} blogs; verwacht ${expected.size}.`);
}

const actualSlugs = new Set(items.map((item) => item.slug));
const missing = [...expected.keys()].filter((slug) => !actualSlugs.has(slug));
const unexpected = [...actualSlugs].filter((slug) => !expected.has(slug));
if (missing.length || unexpected.length) {
  throw new Error(`Slugverschil. Ontbrekend: ${missing.join(', ')}. Onverwacht: ${unexpected.join(', ')}`);
}

const parser = unified().use(rehypeParse);
let checked = 0;
for (const [slug, data] of expected) {
  const response = await get(`/blog/${slug}/?cms_verify=1`);
  const html = await response.text();
  if (response.status !== 200) throw new Error(`/blog/${slug}/ gaf HTTP ${response.status}`);
  const document = parser.parse(html);
  const pageText = normalize(textContent(document));
  if (!pageText.includes(normalize(data.title))) throw new Error(`Titel ontbreekt op ${slug}`);
  const expectedDescription = normalize(data.seoDescription ?? data.description);
  if (normalize(metaDescription(document)) !== expectedDescription) {
    throw new Error(`SEO-beschrijving wijkt af op ${slug}`);
  }
  if (!html.includes(`https://optimaalgroeien.nl/blog/${slug}/`)) {
    throw new Error(`Canonical ontbreekt op ${slug}`);
  }
  if (html.includes('&lt;div class=')) throw new Error(`Ruwe HTML zichtbaar op ${slug}`);
  checked += 1;
  if (checked % 15 === 0 || checked === expected.size) console.log(`Publieke blogs gecontroleerd: ${checked}/${expected.size}`);
}

const expectedOrder = [...expected.entries()]
  .sort(([, left], [, right]) => Date.parse(right.date) - Date.parse(left.date));
const dateFormatter = new Intl.DateTimeFormat('nl-NL', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});
const listedSlugs = [];
const overviewPages = Math.ceil(expectedOrder.length / 12);

for (let page = 1; page <= overviewPages; page += 1) {
  const path = page === 1 ? '/blog/' : `/blog/${page}`;
  const response = await get(`${path}?cms_verify=1`);
  const html = await response.text();
  if (response.status !== 200) throw new Error(`${path} gaf HTTP ${response.status}`);

  const actualSlugs = [...html.matchAll(/href="\/blog\/([^"#?]+)"/g)]
    .map((match) => match[1].replace(/\/$/, ''))
    .filter((slug) => expected.has(slug));
  const expectedPage = expectedOrder.slice((page - 1) * 12, page * 12);
  const expectedSlugs = expectedPage.map(([slug]) => slug);
  if (JSON.stringify(actualSlugs) !== JSON.stringify(expectedSlugs)) {
    throw new Error(`Blogoverzicht ${page} heeft niet de verwachte volgorde of inhoud.`);
  }

  const expectedDates = expectedPage.map(([, data]) => dateFormatter.format(new Date(`${data.date}T12:00:00Z`)));
  const actualDates = [...html.matchAll(/\b\d{1,2} (?:januari|februari|maart|april|mei|juni|juli|augustus|september|oktober|november|december) \d{4}\b/g)]
    .map((match) => match[0]);
  if (JSON.stringify(actualDates) !== JSON.stringify(expectedDates)) {
    throw new Error(`Blogoverzicht ${page} toont niet de oorspronkelijke publicatiedatums.`);
  }
  listedSlugs.push(...actualSlugs);
}

if (new Set(listedSlugs).size !== expected.size || listedSlugs.length !== expected.size) {
  throw new Error(`Blogoverzichten bevatten ${listedSlugs.length} links, waarvan ${new Set(listedSlugs).size} uniek.`);
}
console.log(`Blogoverzichten gecontroleerd: ${overviewPages} pagina's, ${listedSlugs.length} unieke artikelen`);

function sitemapUrls(xml) {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
}

const [staticSitemapResponse, cmsSitemapResponse] = await Promise.all([
  get('/sitemap-0.xml?cms_verify=1'),
  get('/sitemap-posts.xml?cms_verify=1'),
]);
const staticUrls = sitemapUrls(await staticSitemapResponse.text());
const cmsUrls = sitemapUrls(await cmsSitemapResponse.text());
const migratedStaticUrls = staticUrls.filter((url) => /\/blog\/[^/]+\/$/.test(url));
if (migratedStaticUrls.length) {
  throw new Error(`Statische sitemap bevat nog ${migratedStaticUrls.length} gemigreerde blog-URL's.`);
}
const expectedCmsUrls = new Set([...expected.keys()].map((slug) => `${settings.origin}/blog/${slug}`));
const normalizedCmsUrls = new Set(cmsUrls.map((url) => url.replace(/\/$/, '')));
if (normalizedCmsUrls.size !== expectedCmsUrls.size) {
  throw new Error(`CMS sitemap bevat ${normalizedCmsUrls.size} blogs; verwacht ${expectedCmsUrls.size}.`);
}
for (const url of expectedCmsUrls) {
  if (!normalizedCmsUrls.has(url)) throw new Error(`CMS sitemap mist ${url}`);
}

const categories = await (await get('/_emdash/api/taxonomies/category/terms', true)).json();
const tags = await (await get('/_emdash/api/taxonomies/tag/terms', true)).json();
if ((categories?.data?.terms?.length ?? 0) < 8) throw new Error('Niet alle categorieen zijn gemigreerd.');
if ((tags?.data?.terms?.length ?? 0) < 100) throw new Error('Tags zijn niet volledig gemigreerd.');

console.log(`PASS ${target}: ${expected.size} CMS blogs, alle URL's bereikbaar, sitemap zonder dubbelen.`);
