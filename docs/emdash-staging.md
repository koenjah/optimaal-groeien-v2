# EmDash staging plan

EmDash is wired behind `ENABLE_EMDASH=true` so the normal live build stays unchanged.

## Local checks

```bash
npm run build
npm run build:emdash
```

## Cloudflare resources

Use separate staging resources before touching production:

- Worker: `optimaal-groeien-emdash-staging`
- Scan D1 binding `DB`: `optimaal-groeien-staging-scans`
- EmDash D1 binding `EMDASH_DB`: `optimaal-groeien-emdash-staging`
- EmDash media R2 binding `MEDIA`: `optimaal-groeien-emdash-staging-media`

EmDash uses `/_emdash/admin` for the CMS setup wizard and admin panel.

Create the remote resources in the target Cloudflare account before deploy:

```bash
wrangler d1 create optimaal-groeien-staging-scans
wrangler d1 create optimaal-groeien-emdash-staging
wrangler r2 bucket create optimaal-groeien-emdash-staging-media
```

Then copy the returned D1 IDs into the deploy command as `DB_ID` and `EMDASH_DB_ID`, or leave the script defaults and update `scripts/patch-wrangler.mjs` once the IDs are known.

The AI Scan admin still expects the `scan_entries` table on the scan D1 database. Apply the schema to the staging scan database:

```bash
wrangler d1 execute optimaal-groeien-staging-scans --remote --file db/schema.sql
```

## Deploy

Wrangler must be authenticated with the Cloudflare account that should own the final Optimaal Groeien stack. Then run:

```bash
npm run deploy:staging:emdash
```

After deployment, open the worker URL and then `/_emdash/admin` to complete the passkey setup wizard.
On a fresh EmDash database, public routes may redirect to `/_emdash/admin/setup` until setup is completed.
