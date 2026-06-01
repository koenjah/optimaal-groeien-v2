import { inspectUrl, resolveSiteUrl, summarizeInspection } from './client.mjs';

const args = process.argv.slice(2);
const json = args.includes('--json');
const siteIndex = args.indexOf('--site');
const siteArg = siteIndex >= 0 ? args[siteIndex + 1] : undefined;
const urls = args.filter((arg, index) => arg !== '--json' && arg !== '--site' && index !== siteIndex + 1);

if (!urls.length) {
  console.error('Usage: npm run gsc:inspect -- https://optimaalgroeien.nl/privacybeleid/');
  process.exit(1);
}

const siteUrl = await resolveSiteUrl(siteArg);
const results = [];

for (const url of urls) {
  const data = await inspectUrl(url, siteUrl);
  results.push({
    url,
    siteUrl,
    ...summarizeInspection(data),
    ...(json ? { raw: data } : {}),
  });
}

if (json) {
  console.log(JSON.stringify(results, null, 2));
} else {
  console.table(results);
}
