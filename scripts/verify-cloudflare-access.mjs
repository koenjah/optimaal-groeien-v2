#!/usr/bin/env node

const target = process.argv[2];
if (target !== 'production' && target !== 'staging') {
  throw new Error('Gebruik: node scripts/verify-cloudflare-access.mjs <production|staging>');
}

const accountId = 'c6b2726f6f179cede41f156972fd951a';
const expected = target === 'production'
  ? {
      worker: 'optimaal-groeien',
      databaseId: 'eb2e5e8a-12ce-4190-94ec-ee7644a5cbff',
    }
  : {
      worker: 'optimaal-groeien-emdash-staging',
      databaseId: '1dc5542d-cc4e-4e98-a0bc-c2bbd0c22067',
    };

const token = process.env.CLOUDFLARE_API_TOKEN || process.env.CF_API_TOKEN;
const globalKey = process.env.CLOUDFLARE_API_KEY || process.env.CF_GLOBAL_API_KEY;
const email = process.env.CLOUDFLARE_EMAIL || process.env.CF_API_EMAIL;

function authHeaders() {
  if (token) return { Authorization: `Bearer ${token}` };
  if (globalKey && email) {
    return { 'X-Auth-Key': globalKey, 'X-Auth-Email': email };
  }
  throw new Error(
    'Geen expliciete Cloudflare-inlog gevonden. Stel CLOUDFLARE_API_TOKEN in, of CLOUDFLARE_API_KEY en CLOUDFLARE_EMAIL.',
  );
}

async function cloudflare(path) {
  const response = await fetch(`https://api.cloudflare.com/client/v4${path}`, {
    headers: authHeaders(),
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok || payload?.success !== true) {
    const message = payload?.errors?.map((error) => error.message).join(', ') || `HTTP ${response.status}`;
    throw new Error(`Cloudflare-controle mislukt: ${message}`);
  }
  return payload.result;
}

const [database, workerSettings] = await Promise.all([
  cloudflare(`/accounts/${accountId}/d1/database/${expected.databaseId}`),
  cloudflare(`/accounts/${accountId}/workers/scripts/${expected.worker}/settings`),
]);

if (database?.uuid !== expected.databaseId) {
  throw new Error(`Verkeerde ${target} D1-database gevonden`);
}

if (!workerSettings || typeof workerSettings !== 'object') {
  throw new Error(`Worker ${expected.worker} is niet bereikbaar met deze sleutel`);
}

console.log(`Cloudflare-account en ${target}-onderdelen veilig gecontroleerd voor ${expected.worker}`);
