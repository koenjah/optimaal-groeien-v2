#!/usr/bin/env node
// Patches dist/server/wrangler.json with correct Worker name + D1 binding.
// Astro's Cloudflare adapter regenerates the config on each build, so this
// runs after `npm run build` and before `wrangler deploy`.

import fs from 'node:fs';

const wranglerPath = new URL('../dist/server/wrangler.json', import.meta.url);
const entryPath = new URL('../dist/server/entry.mjs', import.meta.url);
const redirectsPath = new URL('../public/_redirects', import.meta.url);
const cmsGuidePath = new URL('./templates/cms-handleiding.html', import.meta.url);
const blogContentPath = new URL('../src/content/blog/', import.meta.url);
const pagesPath = new URL('../src/pages/', import.meta.url);
const cfg = JSON.parse(fs.readFileSync(wranglerPath, 'utf8'));

const enableEmdash = process.env.ENABLE_EMDASH === 'true';
const workerName = process.env.WORKER_NAME ?? 'optimaal-groeien';
const isProduction = workerName === 'optimaal-groeien';
const isEmdashStaging = workerName === 'optimaal-groeien-emdash-staging';
const accountId =
  process.env.CLOUDFLARE_ACCOUNT_ID ??
  process.env.ACCOUNT_ID ??
  (isProduction
    ? 'c6b2726f6f179cede41f156972fd951a'
    : isEmdashStaging
      ? 'c6b2726f6f179cede41f156972fd951a'
      : '');
const scanDbName =
  process.env.DB_NAME ??
  (isProduction ? 'optimaal-groeien-scans' : isEmdashStaging ? 'optimaal-groeien-cms-staging' : 'optimaal-groeien-staging-scans');
const scanDbId =
  process.env.DB_ID ??
  (scanDbName === 'optimaal-groeien-scans'
    ? 'eb2e5e8a-12ce-4190-94ec-ee7644a5cbff'
    : scanDbName === 'optimaal-groeien-cms-staging'
      ? '1dc5542d-cc4e-4e98-a0bc-c2bbd0c22067'
      : '');
const emdashDbName = process.env.EMDASH_DB_NAME ?? (isProduction || isEmdashStaging ? scanDbName : 'duidelijkdag_family');
const emdashDbId = process.env.EMDASH_DB_ID ?? (isProduction || isEmdashStaging ? scanDbId : '');
const mediaBucketName =
  process.env.MEDIA_BUCKET ??
  (isProduction ? 'optimaal-groeien-emdash-media' : 'optimaal-groeien-cms-staging-media');
const sessionKvId =
  process.env.SESSION_KV_ID ??
  (isProduction
    ? 'c13f6e518d28427c8014e6a8abc920f6'
    : isEmdashStaging
      ? 'c6ec2b0a7d7d4bef81b61971f26f178b'
      : '');
const accessAudience = process.env.CF_ACCESS_AUDIENCE?.trim();
const contactToEmail =
  process.env.CONTACT_TO_EMAIL ??
  process.env.CONTACT_RECIPIENT_EMAIL ??
  'marketing@optimaalgroeien.nl';
const contactEmail =
  process.env.CONTACT_EMAIL ??
  (isProduction ? contactToEmail : '');
const resendFromEmail =
  process.env.RESEND_FROM_EMAIL ?? 'Optimaal Groeien <website@send.closersmatch.com>';
const canonicalOrigin =
  process.env.CANONICAL_ORIGIN ??
  (isProduction ? 'https://optimaalgroeien.nl' : '');
const publicHosts = process.env.PUBLIC_HOSTS
  ? process.env.PUBLIC_HOSTS.split(',').map((host) => host.trim()).filter(Boolean)
  : isProduction
    ? ['optimaalgroeien.nl', 'www.optimaalgroeien.nl']
    : [];

cfg.name = workerName;
if (accountId) {
  cfg.account_id = accountId;
}
if (isEmdashStaging) {
  cfg.workers_dev = true;
  cfg.preview_urls = true;
  delete cfg.routes;
}
cfg.assets = {
  ...(cfg.assets ?? {}),
  run_worker_first: true,
};
cfg.compatibility_flags = [
  ...new Set([...(cfg.compatibility_flags ?? []), ...(enableEmdash ? ['nodejs_compat'] : [])]),
];
cfg.kv_namespaces = enableEmdash && sessionKvId
  ? [{ binding: 'SESSION', id: sessionKvId }]
  : [];
cfg.d1_databases = [{
  binding: 'DB',
  database_name: scanDbName,
  ...(scanDbId ? { database_id: scanDbId } : {}),
}];
cfg.vars = {
  ...(cfg.vars ?? {}),
  CONTACT_TO_EMAIL: contactToEmail,
  RESEND_FROM_EMAIL: resendFromEmail,
  ...(accessAudience ? { CF_ACCESS_AUDIENCE: accessAudience } : {}),
};

if (enableEmdash) {
  cfg.d1_databases.push({
    binding: 'EMDASH_DB',
    database_name: emdashDbName,
    ...(emdashDbId ? { database_id: emdashDbId } : {}),
  });
  cfg.r2_buckets = [{
    binding: 'MEDIA',
    bucket_name: mediaBucketName,
  }];
} else {
  cfg.r2_buckets = [];
}

if (cfg.previews) {
  cfg.previews.kv_namespaces = cfg.kv_namespaces;
  cfg.previews.d1_databases = cfg.d1_databases;
  cfg.previews.r2_buckets = cfg.r2_buckets;
}

cfg.send_email = contactEmail
  ? [{
      name: 'CONTACT_EMAIL',
      destination_address: contactEmail,
    }]
  : [];

fs.writeFileSync(wranglerPath, JSON.stringify(cfg, null, 2));

const entry = fs.readFileSync(entryPath, 'utf8');
const workerImport = entry.match(/import \{ w(?: as astroWorker)? \} from "([^"]+)";/);
if (!workerImport) {
  throw new Error('Could not find Astro worker import in dist/server/entry.mjs');
}

const redirectRules = fs
  .readFileSync(redirectsPath, 'utf8')
  .split('\n')
  .map((line) => line.trim())
  .filter((line) => line && !line.startsWith('#'))
  .map((line) => line.split(/\s+/))
  .filter((parts) => parts.length >= 3 && parts[2] === '301')
  .map(([from, to]) => [from, to]);

const reservedBlogSlugs = fs
  .readdirSync(blogContentPath)
  .filter((name) => name.endsWith('.md'))
  .map((name) => {
    const source = fs.readFileSync(new URL(name, blogContentPath), 'utf8');
    const frontmatter = source.match(/^---\s*\n([\s\S]*?)\n---/);
    const slug = frontmatter?.[1].match(/^slug:\s*["']?([^"'\n]+)["']?\s*$/m)?.[1]?.trim();
    return slug || name.replace(/\.md$/, '');
  })
  .sort();

const reservedPageSlugs = fs
  .readdirSync(pagesPath, { withFileTypes: true })
  .flatMap((entry) => {
    if (entry.name.startsWith('[')) return [];
    if (entry.isDirectory()) return [entry.name];
    if (!entry.name.endsWith('.astro')) return [];
    return [entry.name.replace(/\.astro$/, '')];
  })
  .filter((slug) => slug !== '404')
  .sort();
const cmsGuideHtml = fs.readFileSync(cmsGuidePath, 'utf8');

const patchedEntry = `globalThis.process ??= {};
globalThis.process.env ??= {};
import "cloudflare:workers";
import { w as astroWorker } from "${workerImport[1]}";

const canonicalOrigin = ${JSON.stringify(canonicalOrigin)};
const publicHosts = new Set(${JSON.stringify(publicHosts)});
const redirectRules = ${JSON.stringify(redirectRules)};
const redirectMap = new Map(redirectRules);
const reservedContentSlugs = {
  posts: new Set(${JSON.stringify(reservedBlogSlugs)}),
  pages: new Set(${JSON.stringify(reservedPageSlugs)}),
};
const cmsGuideHtml = ${JSON.stringify(cmsGuideHtml)};
const adminBrandCss = \`
  :root,
  [data-theme="kumo"] {
    --font-emdash: Inter, ui-sans-serif, system-ui, sans-serif;
    --color-kumo-brand: #f17a29;
    --color-kumo-brand-hover: #d96500;
    --text-color-kumo-brand: #b45309;
    --text-color-kumo-link: #053b63;
    --color-kumo-focus: #053b63;
    --color-kumo-canvas: #fffcf8;
    --color-kumo-elevated: #fffaf4;
    --color-kumo-recessed: #f1f5f9;
  }

  [data-mode="dark"] {
    --color-kumo-brand: #f17a29;
    --color-kumo-brand-hover: #f59a5a;
    --text-color-kumo-brand: #f59a5a;
    --text-color-kumo-link: #93c5fd;
    --text-color-kumo-default: #e5e7eb;
    --text-color-kumo-strong: #f8fafc;
    --text-color-kumo-subtle: #a3aab5;
    --color-kumo-focus: #f17a29;
    --color-kumo-canvas: #101417;
    --color-kumo-elevated: #151a1e;
    --color-kumo-recessed: #1d2428;
    --color-kumo-base: #111518;
  }

  .emdash-sidebar {
    border-color: rgba(5, 59, 99, 0.18);
  }

  .emdash-brand-link img {
    width: auto;
    max-width: 2rem;
  }

  .og-admin-help {
    position: fixed;
    right: 1rem;
    bottom: 1rem;
    z-index: 1000;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 2.75rem;
    height: 2.75rem;
    border: 1px solid rgba(5, 59, 99, 0.18);
    border-radius: 50%;
    background: #053b63;
    color: white;
    font: 700 1rem/1 Inter, ui-sans-serif, system-ui, sans-serif;
    text-decoration: none;
    box-shadow: 0 8px 24px rgba(5, 59, 99, 0.22);
  }

  .og-admin-help:hover,
  .og-admin-help:focus-visible {
    background: #f17a29;
    outline: 3px solid rgba(241, 122, 41, 0.28);
    outline-offset: 2px;
  }
\`;

function normalizePathname(pathname) {
  return pathname.endsWith("/") && pathname !== "/" ? pathname.slice(0, -1) : pathname;
}

function isHttpRequest(request, url) {
  const forwardedProtocol = request.headers.get("x-forwarded-proto");
  const visitor = request.headers.get("cf-visitor");
  let visitorScheme = "";
  try {
    visitorScheme = visitor ? JSON.parse(visitor).scheme : "";
  } catch {
    visitorScheme = "";
  }
  return url.protocol === "http:" || forwardedProtocol === "http" || visitorScheme === "http";
}

function needsTrailingSlash(url) {
  if (
    url.pathname === "/" ||
    url.pathname.endsWith("/") ||
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/_emdash/")
  ) return false;
  return !/\\.[^/]+$/.test(url.pathname);
}

function makeRedirect(request) {
  const url = new URL(request.url);
  if (!canonicalOrigin || !publicHosts.has(url.hostname)) return null;

  const redirectTarget = redirectMap.get(url.pathname) ?? redirectMap.get(normalizePathname(url.pathname));
  if (redirectTarget) {
    const targetUrl = new URL(redirectTarget, canonicalOrigin);
    targetUrl.search = url.search;
    const alreadyCanonical =
      url.hostname === "optimaalgroeien.nl" &&
      !isHttpRequest(request, url) &&
      targetUrl.pathname === url.pathname &&
      targetUrl.search === url.search;
    if (!alreadyCanonical) return Response.redirect(targetUrl.toString(), 301);
  }

  const addTrailingSlash = needsTrailingSlash(url);
  if (url.hostname !== "optimaalgroeien.nl" || isHttpRequest(request, url) || addTrailingSlash) {
    const targetPathname = addTrailingSlash ? \`\${url.pathname}/\` : url.pathname;
    const targetUrl = new URL(targetPathname, canonicalOrigin);
    targetUrl.search = url.search;
    return Response.redirect(targetUrl.toString(), 301);
  }

  return null;
}

function slugify(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function rejectReservedContentSlug(request) {
  if (request.method !== "POST" && request.method !== "PUT") return null;
  if (request.headers.get("X-OG-Static-Import") === "blogs-v1") return null;
  const url = new URL(request.url);
  const match = url.pathname.match(new RegExp("^/_emdash/api/content/(posts|pages)(?:/[^/]+)?/?$"));
  if (!match) return null;

  let body;
  try {
    body = await request.clone().json();
  } catch {
    return null;
  }

  const explicitSlug = typeof body?.slug === "string" ? body.slug : "";
  const generatedSlug = request.method === "POST" && typeof body?.data?.title === "string"
    ? body.data.title
    : "";
  const slug = slugify(explicitSlug || generatedSlug);
  const collection = match[1];
  if (!slug || !reservedContentSlugs[collection].has(slug)) return null;

  return Response.json({
    success: false,
    error: {
      code: "SLUG_ALREADY_USED",
      message: 'De slug "' + slug + '" wordt al gebruikt door de bestaande website. Kies een andere slug.',
    },
  }, { status: 409 });
}

function applyAdminBranding(response, url) {
  const contentType = response.headers.get("content-type") || "";
  if (!url.pathname.startsWith("/_emdash/admin") || !contentType.includes("text/html")) {
    return response;
  }

  return new HTMLRewriter()
    .on("head", {
      element(element) {
        element.append(\`<style id="optimaal-groeien-admin-brand">\${adminBrandCss}</style>\`, {
          html: true,
        });
      },
    })
    .on("body", {
      element(element) {
        element.append(
          '<a class="og-admin-help" href="/_emdash/admin/handleiding/" aria-label="Open CMS-handleiding" title="CMS-handleiding">?</a>',
          { html: true },
        );
      },
    })
    .transform(response);
}

function serveCmsGuide(url) {
  if (
    url.pathname !== "/_emdash/admin/handleiding"
    && url.pathname !== "/_emdash/admin/handleiding/"
  ) {
    return null;
  }
  return new Response(cmsGuideHtml, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "private, no-store",
      "X-Robots-Tag": "noindex, nofollow",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

function syncRuntimeEnvironment(env) {
  globalThis.__env__ = env;
  if (typeof env.CF_ACCESS_AUDIENCE === "string" && env.CF_ACCESS_AUDIENCE) {
    globalThis.process.env.CF_ACCESS_AUDIENCE = env.CF_ACCESS_AUDIENCE;
  }
}

export default {
  ...astroWorker,
  async fetch(request, env, ctx) {
    syncRuntimeEnvironment(env);
    const url = new URL(request.url);
    const redirect = makeRedirect(request);
    if (redirect) return redirect;
    const cmsGuideResponse = serveCmsGuide(url);
    if (cmsGuideResponse) return cmsGuideResponse;
    const reservedSlugResponse = await rejectReservedContentSlug(request);
    if (reservedSlugResponse) return reservedSlugResponse;
    const response = await astroWorker.fetch(request, env, ctx);
    return applyAdminBranding(response, url);
  },
};
`;

fs.writeFileSync(entryPath, patchedEntry);
console.log(`Patched dist/server/wrangler.json for ${workerName}${enableEmdash ? ' with EmDash bindings' : ''}`);
