import { encodeSiteUrl, gscFetch, resolveSiteUrl, todayMinusDays } from './client.mjs';

const args = process.argv.slice(2);

function readArg(name, fallback) {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : fallback;
}

const days = Number(readArg('--days', 28));
const rowLimit = Number(readArg('--limit', 25));
const dimensions = readArg('--dimensions', 'page')
  .split(',')
  .map((dimension) => dimension.trim())
  .filter(Boolean);
const siteUrl = await resolveSiteUrl(readArg('--site', process.env.GSC_SITE_URL));

const endDate = readArg('--end', todayMinusDays(3));
const startDate = readArg('--start', todayMinusDays(days + 2));

const data = await gscFetch(`https://www.googleapis.com/webmasters/v3/sites/${encodeSiteUrl(siteUrl)}/searchAnalytics/query`, {
  method: 'POST',
  body: {
    startDate,
    endDate,
    dimensions,
    type: 'web',
    rowLimit,
  },
});

console.log(`Property: ${siteUrl}`);
console.log(`Range: ${startDate} to ${endDate}`);
console.table(
  (data.rows ?? []).map((row) => ({
    keys: row.keys?.join(' | ') ?? '',
    clicks: row.clicks,
    impressions: row.impressions,
    ctr: `${(row.ctr * 100).toFixed(2)}%`,
    position: row.position?.toFixed(1),
  })),
);
