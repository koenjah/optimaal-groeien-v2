#!/usr/bin/env node
// Patches dist/server/wrangler.json with correct Worker name + D1 binding.
// Astro's Cloudflare adapter regenerates the config on each build, so this
// runs after `npm run build` and before `wrangler deploy`.

import fs from 'node:fs';

const wranglerPath = new URL('../dist/server/wrangler.json', import.meta.url);
const entryPath = new URL('../dist/server/entry.mjs', import.meta.url);
const redirectsPath = new URL('../public/_redirects', import.meta.url);
const cfg = JSON.parse(fs.readFileSync(wranglerPath, 'utf8'));

cfg.name = 'optimaal-groeien';
cfg.assets = {
  ...(cfg.assets ?? {}),
  run_worker_first: true,
};
cfg.kv_namespaces = [];
cfg.d1_databases = [
  {
    binding: 'DB',
    database_name: 'optimaal-groeien-scans',
    database_id: 'eb2e5e8a-12ce-4190-94ec-ee7644a5cbff',
  },
];
if (cfg.previews) {
  cfg.previews.kv_namespaces = [];
  cfg.previews.d1_databases = cfg.d1_databases;
}

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

const canonicalOrigin = "https://optimaalgroeien.nl";
const publicHosts = new Set(["optimaalgroeien.nl", "www.optimaalgroeien.nl"]);
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
  if (!publicHosts.has(url.hostname)) return null;

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
console.log('✓ Patched dist/server/wrangler.json with D1 binding and Worker-first redirects');
