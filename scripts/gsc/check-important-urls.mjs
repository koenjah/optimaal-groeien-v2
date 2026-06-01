import { inspectUrl, resolveSiteUrl, summarizeInspection } from './client.mjs';

const urls = [
  'https://optimaalgroeien.nl/',
  'https://optimaalgroeien.nl/ai-scan/',
  'https://optimaalgroeien.nl/algemene-voorwaarden/',
  'https://optimaalgroeien.nl/privacybeleid/',
  'https://optimaalgroeien.nl/contact/',
  'https://optimaalgroeien.nl/blog/',
  'https://www.optimaalgroeien.nl/',
];

const siteUrl = await resolveSiteUrl();
const rows = [];

for (const url of urls) {
  try {
    const data = await inspectUrl(url, siteUrl);
    rows.push({ url, ok: true, ...summarizeInspection(data) });
  } catch (error) {
    rows.push({ url, ok: false, error: error.message });
  }
}

console.log(`Property: ${siteUrl}`);
console.table(rows);
