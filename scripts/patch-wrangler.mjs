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
  (isProduction || isEmdashStaging ? '1a908255c94d3901bd9cdd3bd565704b' : '');
const scanDbName =
  process.env.DB_NAME ??
  (isProduction ? 'optimaal-groeien-leads' : isEmdashStaging ? 'duidelijkdag_family' : 'optimaal-groeien-staging-scans');
const scanDbId =
  process.env.DB_ID ??
  (scanDbName === 'optimaal-groeien-leads'
    ? 'c282d443-d328-45ca-b334-ba6bdf901814'
    : scanDbName === 'duidelijkdag_family'
      ? 'd63dd757-5070-46c1-9a62-da000bfd53d4'
      : '');
const emdashDbName = process.env.EMDASH_DB_NAME ?? (isProduction ? scanDbName : 'duidelijkdag_family');
const emdashDbId = process.env.EMDASH_DB_ID ?? (isProduction || isEmdashStaging ? scanDbId : '');
const mediaBucketName = process.env.MEDIA_BUCKET ?? 'optimaal-groeien-emdash-staging-media';
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
  if (url.pathname === "/" || url.pathname.endsWith("/") || url.pathname.startsWith("/api/")) return false;
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

export default {
  ...astroWorker,
  fetch(request, env, ctx) {
    const redirect = makeRedirect(request);
    if (redirect) return redirect;
    return astroWorker.fetch(request, env, ctx);
  },
};
`;

fs.writeFileSync(entryPath, patchedEntry);
console.log(`Patched dist/server/wrangler.json for ${workerName}${enableEmdash ? ' with EmDash bindings' : ''}`);
