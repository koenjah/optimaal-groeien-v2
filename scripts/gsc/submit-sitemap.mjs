import { encodeSiteUrl, gscFetch, resolveSiteUrl, WRITE_SCOPE } from './client.mjs';

const sitemapUrl = process.argv[2] ?? 'https://optimaalgroeien.nl/sitemap-index.xml';
const siteUrl = await resolveSiteUrl();

await gscFetch(
  `https://www.googleapis.com/webmasters/v3/sites/${encodeSiteUrl(siteUrl)}/sitemaps/${encodeURIComponent(sitemapUrl)}`,
  { method: 'PUT' },
  [WRITE_SCOPE],
);

console.log(`Submitted ${sitemapUrl} to ${siteUrl}`);
