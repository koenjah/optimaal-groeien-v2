import { listSites } from './client.mjs';

const sites = await listSites();

if (!sites.length) {
  console.log('No Search Console properties found for this Google account.');
  process.exit(0);
}

console.table(
  sites.map((site) => ({
    siteUrl: site.siteUrl,
    permissionLevel: site.permissionLevel,
  })),
);
