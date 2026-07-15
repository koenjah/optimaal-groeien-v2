#!/usr/bin/env node

import fs from 'node:fs';

const target = process.argv[2];
if (target !== 'production' && target !== 'staging') {
  throw new Error('Usage: node scripts/verify-deploy-config.mjs <production|staging>');
}

const configPath = new URL('../dist/server/wrangler.json', import.meta.url);
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

const expected = target === 'production'
  ? {
      name: 'optimaal-groeien',
      databaseName: 'optimaal-groeien-scans',
      databaseId: 'eb2e5e8a-12ce-4190-94ec-ee7644a5cbff',
      mediaBucket: 'optimaal-groeien-emdash-media',
      sessionKvId: 'c13f6e518d28427c8014e6a8abc920f6',
      audience: '000cce177eaf0be0c356b9873108e74763fd7afd8f25d66310952416108a713c',
      hasEmailBinding: true,
    }
  : {
      name: 'optimaal-groeien-emdash-staging',
      databaseName: 'optimaal-groeien-cms-staging',
      databaseId: '1dc5542d-cc4e-4e98-a0bc-c2bbd0c22067',
      mediaBucket: 'optimaal-groeien-cms-staging-media',
      sessionKvId: 'c6ec2b0a7d7d4bef81b61971f26f178b',
      audience: 'b07f4eca9202ce7a51433be4e34cf1e18b9bb6bdd1315da39bc43ab7489f38ce',
      hasEmailBinding: false,
    };

const errors = [];
const check = (condition, message) => {
  if (!condition) errors.push(message);
};

check(config.name === expected.name, `Worker name must be ${expected.name}`);
check(
  config.account_id === 'c6b2726f6f179cede41f156972fd951a',
  'Cloudflare account must be the isolated Optimaal Groeien account',
);
check(config.compatibility_flags?.includes('nodejs_compat'), 'nodejs_compat must be enabled');
check(config.assets?.run_worker_first === true, 'assets.run_worker_first must be enabled');

for (const binding of ['DB', 'EMDASH_DB']) {
  const database = config.d1_databases?.find((item) => item.binding === binding);
  check(database, `Missing D1 binding ${binding}`);
  check(database?.database_name === expected.databaseName, `${binding} has the wrong database name`);
  check(database?.database_id === expected.databaseId, `${binding} has the wrong database ID`);
}

const session = config.kv_namespaces?.find((item) => item.binding === 'SESSION');
check(session?.id === expected.sessionKvId, 'SESSION has the wrong KV namespace');

const media = config.r2_buckets?.find((item) => item.binding === 'MEDIA');
check(media?.bucket_name === expected.mediaBucket, 'MEDIA has the wrong R2 bucket');
check(config.vars?.CF_ACCESS_AUDIENCE === expected.audience, 'Cloudflare Access audience is wrong');
check(
  config.vars?.CONTACT_TO_EMAIL === 'marketing@optimaalgroeien.nl',
  'Contact recipient must be marketing@optimaalgroeien.nl',
);

const emailBinding = config.send_email?.find((item) => item.name === 'CONTACT_EMAIL');
if (expected.hasEmailBinding) {
  check(
    emailBinding?.destination_address === 'marketing@optimaalgroeien.nl',
    'Production contact email binding is missing or incorrect',
  );
} else {
  check((config.send_email?.length ?? 0) === 0, 'Staging must not be able to send contact email');
  check(config.workers_dev === true, 'Staging workers.dev URL must stay enabled');
  check(!config.routes, 'Staging deploy config must not overwrite production routes');
}

if (errors.length > 0) {
  console.error(`Unsafe ${target} deploy configuration:`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Verified safe ${target} deploy configuration for ${config.name}`);
