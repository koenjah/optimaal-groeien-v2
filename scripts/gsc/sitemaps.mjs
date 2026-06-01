import { encodeSiteUrl, gscFetch, resolveSiteUrl } from './client.mjs';

const siteUrl = await resolveSiteUrl();
const data = await gscFetch(`https://www.googleapis.com/webmasters/v3/sites/${encodeSiteUrl(siteUrl)}/sitemaps`);
const sitemaps = data.sitemap ?? [];

console.log(`Property: ${siteUrl}`);

if (!sitemaps.length) {
  console.log('No sitemaps found.');
  process.exit(0);
}

console.table(
  sitemaps.map((sitemap) => ({
    path: sitemap.path,
    lastSubmitted: sitemap.lastSubmitted,
    isPending: sitemap.isPending,
    isSitemapsIndex: sitemap.isSitemapsIndex,
    errors: sitemap.errors,
    warnings: sitemap.warnings,
  })),
);
