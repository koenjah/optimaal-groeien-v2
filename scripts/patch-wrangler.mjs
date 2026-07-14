#!/usr/bin/env node
// Patches dist/server/wrangler.json with correct Worker name + D1 binding.
// Astro's Cloudflare adapter regenerates the config on each build, so this
// runs after `npm run build` and before `wrangler deploy`.

import fs from 'node:fs';

const wranglerPath = new URL('../dist/server/wrangler.json', import.meta.url);
const entryPath = new URL('../dist/server/entry.mjs', import.meta.url);
const redirectsPath = new URL('../public/_redirects', import.meta.url);
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
      ? '1a908255c94d3901bd9cdd3bd565704b'
      : '');
const scanDbName =
  process.env.DB_NAME ??
  (isProduction ? 'optimaal-groeien-scans' : isEmdashStaging ? 'duidelijkdag_family' : 'optimaal-groeien-staging-scans');
const scanDbId =
  process.env.DB_ID ??
  (scanDbName === 'optimaal-groeien-scans'
    ? 'eb2e5e8a-12ce-4190-94ec-ee7644a5cbff'
    : scanDbName === 'duidelijkdag_family'
      ? 'd63dd757-5070-46c1-9a62-da000bfd53d4'
      : '');
const emdashDbName = process.env.EMDASH_DB_NAME ?? (isProduction ? scanDbName : 'duidelijkdag_family');
const emdashDbId = process.env.EMDASH_DB_ID ?? (isProduction || isEmdashStaging ? scanDbId : '');
const mediaBucketName =
  process.env.MEDIA_BUCKET ??
  (isProduction ? 'optimaal-groeien-emdash-media' : 'optimaal-groeien-emdash-staging-media');
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
cfg.assets = {
  ...(cfg.assets ?? {}),
  run_worker_first: true,
};
cfg.compatibility_flags = [
  ...new Set([...(cfg.compatibility_flags ?? []), ...(enableEmdash ? ['nodejs_compat'] : [])]),
];
cfg.kv_namespaces = [];
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
  cfg.previews.kv_namespaces = [];
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

const patchedEntry = `globalThis.process ??= {};
globalThis.process.env ??= {};
import "cloudflare:workers";
import { w as astroWorker } from "${workerImport[1]}";

const canonicalOrigin = ${JSON.stringify(canonicalOrigin)};
const publicHosts = new Set(${JSON.stringify(publicHosts)});
const redirectRules = ${JSON.stringify(redirectRules)};
const redirectMap = new Map(redirectRules);
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
    --color-kumo-focus: #f17a29;
  }

  .emdash-sidebar {
    border-color: rgba(5, 59, 99, 0.18);
  }

  .emdash-brand-link img {
    width: auto;
    max-width: 2rem;
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
    .transform(response);
}

function syncRuntimeEnvironment(env) {
  if (typeof env.CF_ACCESS_AUDIENCE === "string" && env.CF_ACCESS_AUDIENCE) {
    globalThis.process.env.CF_ACCESS_AUDIENCE = env.CF_ACCESS_AUDIENCE;
  }
}

export default {
  ...astroWorker,
  async fetch(request, env, ctx) {
    syncRuntimeEnvironment(env);
    const redirect = makeRedirect(request);
    if (redirect) return redirect;
    const response = await astroWorker.fetch(request, env, ctx);
    return applyAdminBranding(response, new URL(request.url));
  },
};
`;

fs.writeFileSync(entryPath, patchedEntry);
console.log(`Patched dist/server/wrangler.json for ${workerName}${enableEmdash ? ' with EmDash bindings' : ''}`);
