import fs from 'node:fs/promises';
import path from 'node:path';
import { GoogleAuth, OAuth2Client } from 'google-auth-library';

export const SCOPE = 'https://www.googleapis.com/auth/webmasters.readonly';
export const WRITE_SCOPE = 'https://www.googleapis.com/auth/webmasters';
export const GSC_DIR = path.resolve(process.cwd(), '.gsc');
export const OAUTH_CLIENT_PATH = path.join(GSC_DIR, 'oauth-client.json');
export const SERVICE_ACCOUNT_PATH = path.join(GSC_DIR, 'service-account.json');
export const TOKEN_PATH = path.join(GSC_DIR, 'token.json');
export const DEFAULT_SITE_HOST = 'optimaalgroeien.nl';

export async function ensureGscDir() {
  await fs.mkdir(GSC_DIR, { recursive: true, mode: 0o700 });
}

export async function loadOAuthConfig() {
  if (process.env.GSC_CLIENT_ID && process.env.GSC_CLIENT_SECRET) {
    return {
      clientId: process.env.GSC_CLIENT_ID,
      clientSecret: process.env.GSC_CLIENT_SECRET,
      redirectUris: [],
    };
  }

  let parsed;
  try {
    parsed = JSON.parse(await fs.readFile(OAUTH_CLIENT_PATH, 'utf8'));
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new Error(
        `Missing Search Console credentials. Save a service account key at ${SERVICE_ACCOUNT_PATH}, or save an OAuth client JSON at ${OAUTH_CLIENT_PATH} and run npm run gsc:auth.`,
      );
    }
    throw error;
  }

  const cfg = parsed.installed ?? parsed.web ?? parsed;
  if (!cfg.client_id || !cfg.client_secret) {
    throw new Error(`${OAUTH_CLIENT_PATH} does not look like a Google OAuth client JSON.`);
  }

  return {
    clientId: cfg.client_id,
    clientSecret: cfg.client_secret,
    redirectUris: cfg.redirect_uris ?? [],
  };
}

export function makeOAuthClient(config, redirectUri) {
  return new OAuth2Client(config.clientId, config.clientSecret, redirectUri ?? config.redirectUris[0]);
}

export async function saveToken(tokens) {
  await ensureGscDir();
  await fs.writeFile(TOKEN_PATH, `${JSON.stringify(tokens, null, 2)}\n`, { mode: 0o600 });
}

export async function loadToken() {
  try {
    return JSON.parse(await fs.readFile(TOKEN_PATH, 'utf8'));
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new Error(`Missing ${TOKEN_PATH}. Run npm run gsc:auth first.`);
    }
    throw error;
  }
}

export async function getAuthClient(scopes = [SCOPE]) {
  const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS ?? SERVICE_ACCOUNT_PATH;
  try {
    await fs.access(serviceAccountPath);
    const auth = new GoogleAuth({
      keyFile: serviceAccountPath,
      scopes,
    });
    return auth.getClient();
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }

  const config = await loadOAuthConfig();
  const client = makeOAuthClient(config);
  const token = await loadToken();

  client.setCredentials(token);
  client.on('tokens', async (tokens) => {
    const merged = { ...token, ...tokens };
    if (!tokens.refresh_token && token.refresh_token) {
      merged.refresh_token = token.refresh_token;
    }
    await saveToken(merged);
  });

  return client;
}

export async function gscFetch(url, options = {}, scopes = [SCOPE]) {
  const client = await getAuthClient(scopes);
  const { token } = await client.getAccessToken();

  if (!token) {
    throw new Error('Google OAuth did not return an access token.');
  }

  const headers = {
    Authorization: `Bearer ${token}`,
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    ...(options.headers ?? {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
    body: options.body && typeof options.body !== 'string' ? JSON.stringify(options.body) : options.body,
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message = data?.error?.message ?? text ?? response.statusText;
    throw new Error(`${response.status} ${response.statusText}: ${message}`);
  }

  return data;
}

export function encodeSiteUrl(siteUrl) {
  return encodeURIComponent(siteUrl);
}

export async function listSites() {
  const data = await gscFetch('https://www.googleapis.com/webmasters/v3/sites');
  return data.siteEntry ?? [];
}

export async function resolveSiteUrl(preferredSiteUrl = process.env.GSC_SITE_URL) {
  if (preferredSiteUrl) return preferredSiteUrl;

  const sites = await listSites();
  const candidates = sites
    .map((site) => site.siteUrl)
    .filter((siteUrl) => siteUrl.includes(DEFAULT_SITE_HOST));

  const preferred =
    candidates.find((siteUrl) => siteUrl === `sc-domain:${DEFAULT_SITE_HOST}`) ??
    candidates.find((siteUrl) => siteUrl === `https://${DEFAULT_SITE_HOST}/`) ??
    candidates.find((siteUrl) => siteUrl === `https://www.${DEFAULT_SITE_HOST}/`) ??
    candidates[0];

  if (!preferred) {
    const available = sites.map((site) => site.siteUrl).join(', ') || 'none';
    throw new Error(`No Search Console property found for ${DEFAULT_SITE_HOST}. Available properties: ${available}`);
  }

  return preferred;
}

export async function inspectUrl(inspectionUrl, siteUrl = process.env.GSC_SITE_URL) {
  const resolvedSiteUrl = await resolveSiteUrl(siteUrl);
  return gscFetch('https://searchconsole.googleapis.com/v1/urlInspection/index:inspect', {
    method: 'POST',
    body: {
      inspectionUrl,
      siteUrl: resolvedSiteUrl,
      languageCode: 'nl-NL',
    },
  });
}

export function summarizeInspection(data) {
  const result = data.inspectionResult ?? {};
  const index = result.indexStatusResult ?? {};
  const mobile = result.mobileUsabilityResult ?? {};
  const rich = result.richResultsResult ?? {};

  return {
    verdict: index.verdict ?? '',
    coverage: index.coverageState ?? '',
    indexingState: index.indexingState ?? '',
    robots: index.robotsTxtState ?? '',
    pageFetch: index.pageFetchState ?? '',
    lastCrawl: index.lastCrawlTime ?? '',
    googleCanonical: index.googleCanonical ?? '',
    userCanonical: index.userCanonical ?? '',
    mobile: mobile.verdict ?? '',
    richResults: rich.verdict ?? '',
  };
}

export function todayMinusDays(days) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - days);
  return date.toISOString().slice(0, 10);
}
