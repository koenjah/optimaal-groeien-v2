#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createMarkdownProcessor } from '@astrojs/markdown-remark';
import { htmlToPortableText } from '@emdash-cms/gutenberg-to-portable-text';
import { extractPlainText } from 'emdash';
import yaml from 'js-yaml';
import rehypeParse from 'rehype-parse';
import rehypeStringify from 'rehype-stringify';
import { unified } from 'unified';
import { SKIP, visit } from 'unist-util-visit';

const args = process.argv.slice(2);
const valueArg = (name) => args.find((arg) => arg.startsWith(`${name}=`))?.slice(name.length + 1);
const hasArg = (name) => args.includes(name);
const target = valueArg('--target') ?? 'staging';
const dryRun = hasArg('--dry-run');
const limit = Number(valueArg('--limit') ?? Number.POSITIVE_INFINITY);

if (!['staging', 'production'].includes(target)) {
  throw new Error('Gebruik --target=staging of --target=production.');
}
if (!dryRun && target === 'production' && !hasArg('--confirm-production=IMPORT_90_BLOGS')) {
  throw new Error('Productie-import vereist --confirm-production=IMPORT_90_BLOGS.');
}

const settings = target === 'production'
  ? {
      origin: 'https://optimaalgroeien.nl',
      cookieFile: '/tmp/og-cms-production-e2e/cookies',
    }
  : {
      origin: 'https://cms-staging.optimaalgroeien.nl',
      cookieFile: '/tmp/og-cms-staging-e2e/cookies',
    };

const blogDirectory = fileURLToPath(new URL('../src/content/blog/', import.meta.url));
const markdownProcessor = await createMarkdownProcessor();

function normalizeText(value) {
  return String(value ?? '').replace(/\s+/g, ' ').trim();
}

function nodeText(node) {
  if (!node) return '';
  if (node.type === 'text') return node.value ?? '';
  return Array.isArray(node.children) ? node.children.map(nodeText).join(' ') : '';
}

function classNames(node) {
  const value = node?.properties?.className;
  if (Array.isArray(value)) return value.map(String);
  return typeof value === 'string' ? value.split(/\s+/) : [];
}

function element(tagName, text, strong = false) {
  const textNode = { type: 'text', value: text };
  return {
    type: 'element',
    tagName,
    properties: {},
    children: strong
      ? [{ type: 'element', tagName: 'strong', properties: {}, children: [textNode] }]
      : [textNode],
  };
}

function tableReplacement(node) {
  const rows = [];
  visit(node, 'element', (child) => {
    if (child.tagName !== 'tr') return;
    const cells = child.children
      .filter((item) => item.type === 'element' && ['th', 'td'].includes(item.tagName))
      .map((item) => normalizeText(nodeText(item)));
    if (cells.length) rows.push(cells);
  });
  if (!rows.length) return [];

  const headers = rows[0];
  const dataRows = rows.length > 1 ? rows.slice(1) : rows;
  return dataRows.map((cells) => {
    const parts = cells.map((cell, index) => {
      const header = headers[index];
      return index > 0 && header && header !== cell ? `${header}: ${cell}` : cell;
    });
    return element('p', parts.join(' | '), true);
  });
}

function makeSemanticHtml(html) {
  const processor = unified().use(rehypeParse, { fragment: true }).use(rehypeStringify);
  const tree = processor.parse(html);
  const sourceText = normalizeText(nodeText(tree));

  visit(tree, 'element', (node, index, parent) => {
    const classes = classNames(node);

    if (node.tagName === 'table' && parent && typeof index === 'number') {
      parent.children.splice(index, 1, ...tableReplacement(node));
      return [SKIP, index];
    }

    if (classes.some((name) => ['inzicht', 'tip', 'citaat', 'getal', 'artikel-cta'].includes(name))) {
      node.tagName = 'blockquote';
    }
    if (classes.includes('stappen')) {
      node.tagName = 'ol';
      node.children = node.children.filter((child) => !normalizeText(nodeText(child)) || classNames(child).includes('stap'));
    }
    if (classes.includes('stap')) {
      node.tagName = 'li';
      node.children = node.children.filter((child) => !classNames(child).includes('stap-nr'));
    }
    if (classes.includes('stap-tekst')) node.tagName = 'span';
    if (classes.includes('check')) {
      node.tagName = 'span';
      node.children = [];
    }
    if (classes.some((name) => name.endsWith('-label'))) {
      node.tagName = 'strong';
      const label = normalizeText(nodeText(node));
      node.children = [{ type: 'text', value: label.endsWith(':') ? `${label} ` : `${label}: ` }];
    }

    if (node.properties?.className) delete node.properties.className;
  });

  return { html: processor.stringify(tree), sourceText };
}

function parseBlog(source, filename) {
  const match = source.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
  if (!match) throw new Error(`Geen geldige frontmatter in ${filename}`);
  const data = yaml.load(match[1]);
  if (!data || typeof data !== 'object') throw new Error(`Ongeldige frontmatter in ${filename}`);
  return { data, markdown: match[2] };
}

function slugify(value) {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function convertBlog(filename) {
  const source = await readFile(`${blogDirectory}/${filename}`, 'utf8');
  const { data, markdown } = parseBlog(source, filename);
  const rendered = await markdownProcessor.render(markdown);
  const semantic = makeSemanticHtml(rendered.code);
  const content = htmlToPortableText(semantic.html).filter((block) => block?._type !== 'break');
  const convertedText = normalizeText(extractPlainText(content));
  const coverage = semantic.sourceText.length
    ? convertedText.length / semantic.sourceText.length
    : 1;

  if (!data.title || !data.slug || !data.description || !data.date) {
    throw new Error(`Verplichte bloggegevens ontbreken in ${filename}`);
  }
  if (!content.length || coverage < 0.9) {
    throw new Error(`Conversie verloor te veel tekst in ${filename}: ${(coverage * 100).toFixed(1)}%`);
  }

  const publishedAt = new Date(data.date).toISOString();
  const category = String(data.category ?? 'Blog').trim() || 'Blog';
  const tags = Array.isArray(data.tags) ? data.tags.map(String).filter(Boolean) : [];
  const heroImage = typeof data.heroImage === 'string' ? data.heroImage : undefined;

  return {
    filename,
    slug: String(data.slug),
    publishedAt,
    category,
    tags,
    coverage,
    sourceHash: createHash('sha256').update(source).digest('hex'),
    payload: {
      slug: String(data.slug),
      status: 'draft',
      createdAt: publishedAt,
      data: {
        title: String(data.title),
        excerpt: String(data.description),
        content,
        category,
        author: String(data.author ?? 'Stefan Kelderman'),
        hero_alt: String(data.heroAlt ?? data.title),
        ...(heroImage ? { featured_image: heroImage } : {}),
      },
      seo: {
        title: String(data.seoTitle ?? data.title),
        description: String(data.seoDescription ?? data.description),
        image: heroImage ?? null,
        canonical: `https://optimaalgroeien.nl/blog/${data.slug}/`,
        noIndex: false,
      },
    },
  };
}

async function readCookie(file, hostname) {
  const jar = await readFile(file, 'utf8');
  const cookies = [];
  for (const rawLine of jar.split('\n')) {
    if (!rawLine || (rawLine.startsWith('#') && !rawLine.startsWith('#HttpOnly_'))) continue;
    const parts = rawLine.replace(/^#HttpOnly_/, '').split('\t');
    if (parts.length >= 7 && (parts[0] === hostname || parts[0] === `.${hostname}`)) {
      cookies.push(`${parts[5]}=${parts[6]}`);
    }
  }
  if (!cookies.length) throw new Error(`Geen geldige Access-cookie in ${file}`);
  return cookies.join('; ');
}

const filenames = (await readdir(blogDirectory))
  .filter((name) => name.endsWith('.md'))
  .sort()
  .slice(0, Number.isFinite(limit) ? limit : undefined);
const blogs = [];
for (const filename of filenames) blogs.push(await convertBlog(filename));

const lowestCoverage = Math.min(...blogs.map((blog) => blog.coverage));
console.log(`Conversie: ${blogs.length} blogs, laagste tekstdekking ${(lowestCoverage * 100).toFixed(1)}%`);
if (dryRun) {
  console.log('Dry-run geslaagd; er is niets naar een CMS geschreven.');
  process.exit();
}

const cookie = await readCookie(settings.cookieFile, new URL(settings.origin).hostname);
const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function api(path, options = {}) {
  const method = options.method ?? 'GET';
  const retryable = options.retry === true || ['GET', 'PUT', 'DELETE'].includes(method);
  const attempts = retryable ? 4 : 1;
  const { retry: _retry, ...requestOptions } = options;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(`${settings.origin}${path}`, {
        redirect: 'manual',
        ...requestOptions,
        headers: {
          Cookie: cookie,
          'X-EmDash-Request': '1',
          'X-OG-Static-Import': 'blogs-v1',
          ...(requestOptions.body ? { 'Content-Type': 'application/json' } : {}),
          ...requestOptions.headers,
        },
      });
      const text = await response.text();
      if (!response.ok && retryable && attempt < attempts
        && (response.status === 429 || response.status >= 500)) {
        await wait(attempt * 1000);
        continue;
      }
      if (!response.ok) {
        const error = new Error(`${method} ${path}: HTTP ${response.status} ${text.slice(0, 500)}`);
        error.status = response.status;
        throw error;
      }

      try {
        return text ? JSON.parse(text) : null;
      } catch (cause) {
        if (retryable && attempt < attempts) {
          await wait(attempt * 1000);
          continue;
        }
        const error = new Error(`${method} ${path}: antwoord was geen geldige JSON`);
        error.cause = cause;
        throw error;
      }
    } catch (error) {
      if (!retryable || attempt === attempts || !error?.cause) throw error;
      await wait(attempt * 1000);
    }
  }

  throw new Error(`${method} ${path}: verzoek bleef mislukken`);
}

async function ensureSchema() {
  const schema = await api('/_emdash/api/schema/collections/posts?includeFields=true');
  const fields = new Set((schema?.data?.item?.fields ?? []).map((field) => field.slug));
  const definitions = [
    { slug: 'category', label: 'Categorie', type: 'string', sortOrder: 4, searchable: true },
    { slug: 'author', label: 'Auteur', type: 'string', sortOrder: 5 },
    { slug: 'hero_alt', label: 'Beschrijving hoofdafbeelding', type: 'string', sortOrder: 6 },
  ];
  for (const definition of definitions) {
    if (!fields.has(definition.slug)) {
      await api('/_emdash/api/schema/collections/posts/fields', {
        method: 'POST',
        body: JSON.stringify(definition),
      });
    }
  }
  await api('/_emdash/api/schema/collections/pages', {
    method: 'PUT',
    body: JSON.stringify({
      label: "Losse pagina's",
      labelSingular: 'Losse pagina',
      description: 'Nieuwe eenvoudige pagina\'s. Vaste maatwerkpagina\'s blijven technisch beheerd.',
    }),
  });
}

const termMaps = new Map();
async function termsFor(taxonomy) {
  if (termMaps.has(taxonomy)) return termMaps.get(taxonomy);
  const response = await api(`/_emdash/api/taxonomies/${taxonomy}/terms`);
  const map = new Map((response?.data?.terms ?? []).map((term) => [term.slug, term]));
  termMaps.set(taxonomy, map);
  return map;
}

async function ensureTerm(taxonomy, label) {
  const map = await termsFor(taxonomy);
  const slug = slugify(label);
  if (map.has(slug)) return map.get(slug);
  let response;
  try {
    response = await api(`/_emdash/api/taxonomies/${taxonomy}/terms`, {
      method: 'POST',
      body: JSON.stringify({ slug, label }),
    });
  } catch (error) {
    termMaps.delete(taxonomy);
    const refreshed = await termsFor(taxonomy);
    if (refreshed.has(slug)) return refreshed.get(slug);
    throw error;
  }
  const term = response?.data?.term ?? response?.data?.item;
  if (!term?.id) throw new Error(`Term kon niet worden aangemaakt: ${taxonomy}/${label}`);
  map.set(slug, term);
  return term;
}

await ensureSchema();
const existingResponse = await api('/_emdash/api/content/posts?limit=100');
const existing = new Map((existingResponse?.data?.items ?? []).map((item) => [item.slug, item]));

const timestamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
const manifestDirectory = '/Users/gebruiker/Documents/STEFAN/backups/optimaal-groeien/content-migrations';
const manifestPath = `${manifestDirectory}/${target}-static-blogs-${timestamp}.json`;
await mkdir(manifestDirectory, { recursive: true });
const manifest = {
  target,
  origin: settings.origin,
  createdAt: new Date().toISOString(),
  created: [],
  skipped: [],
};

async function saveManifest() {
  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
}

for (const [index, blog] of blogs.entries()) {
  const existingItem = existing.get(blog.slug);
  if (existingItem?.status === 'published') {
    manifest.skipped.push({ slug: blog.slug, reason: 'bestaat al' });
    continue;
  }

  let id = existingItem?.id;
  try {
    if (!id) {
      try {
        const created = await api('/_emdash/api/content/posts', {
          method: 'POST',
          body: JSON.stringify(blog.payload),
        });
        id = created?.data?.item?.id;
      } catch (error) {
        const refreshed = await api('/_emdash/api/content/posts?limit=100');
        const recovered = refreshed?.data?.items?.find((item) => item.slug === blog.slug);
        if (!recovered?.id) throw error;
        id = recovered.id;
      }
      if (!id) throw new Error(`Geen ID ontvangen voor ${blog.slug}`);
    }

    const category = await ensureTerm('category', blog.category);
    await api(`/_emdash/api/content/posts/${id}/terms/category`, {
      method: 'POST',
      retry: true,
      body: JSON.stringify({ termIds: [category.id] }),
    });

    const tagTerms = [];
    for (const tag of blog.tags) tagTerms.push(await ensureTerm('tag', tag));
    await api(`/_emdash/api/content/posts/${id}/terms/tag`, {
      method: 'POST',
      retry: true,
      body: JSON.stringify({ termIds: [...new Set(tagTerms.map((term) => term.id))] }),
    });

    await api(`/_emdash/api/content/posts/${id}/publish`, {
      method: 'POST',
      retry: true,
      body: JSON.stringify({ publishedAt: blog.publishedAt }),
    });

    existing.set(blog.slug, { id, slug: blog.slug });
    manifest.created.push({
      id,
      slug: blog.slug,
      source: basename(blog.filename),
      sourceHash: blog.sourceHash,
      publishedAt: blog.publishedAt,
      resumed: Boolean(existingItem),
    });
    await saveManifest();
  } catch (error) {
    if (id) {
      await api(`/_emdash/api/content/posts/${id}`, { method: 'DELETE' }).catch(() => null);
      await api(`/_emdash/api/content/posts/${id}/permanent`, { method: 'DELETE' }).catch(() => null);
    }
    throw error;
  }

  if ((index + 1) % 10 === 0 || index === blogs.length - 1) {
    console.log(`Geimporteerd: ${index + 1}/${blogs.length}`);
  }
}

await saveManifest();
console.log(`Import gereed: ${manifest.created.length} gemaakt, ${manifest.skipped.length} overgeslagen.`);
console.log(`Manifest: ${manifestPath}`);
