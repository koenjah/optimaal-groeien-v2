import { defineMiddleware } from 'astro:middleware';
import { env as cloudflareEnv } from 'cloudflare:workers';

type AssetsBinding = {
  fetch(request: Request): Promise<Response>;
};

type D1PreparedStatement = {
  first<T = unknown>(): Promise<T | null>;
  all<T = unknown>(): Promise<{ results?: T[] }>;
};

type D1Database = {
  prepare(query: string): D1PreparedStatement;
};

type SitemapState = {
  count: number;
  lastmod: string | null;
};

function sitemapStateQuery(table: 'ec_posts' | 'ec_pages', collection: 'posts' | 'pages') {
  return `
    SELECT COUNT(*) AS count, MAX(c.updated_at) AS lastmod
    FROM ${table} c
    LEFT JOIN _emdash_seo s
      ON s.collection = '${collection}' AND s.content_id = c.id
    WHERE c.status = 'published'
      AND c.deleted_at IS NULL
      AND (s.seo_no_index IS NULL OR s.seo_no_index = 0)
  `;
}

function sitemapEntry(origin: string, filename: string, lastmod?: string | null) {
  return [
    '  <sitemap>',
    `    <loc>${origin}/${filename}</loc>`,
    ...(lastmod ? [`    <lastmod>${lastmod}</lastmod>`] : []),
    '  </sitemap>',
  ].join('\n');
}

async function createSitemapIndex(origin: string, database?: D1Database) {
  const entries = [sitemapEntry(origin, 'sitemap-0.xml')];

  if (database) {
    try {
      const [posts, pages] = await Promise.all([
        database.prepare(sitemapStateQuery('ec_posts', 'posts')).first<SitemapState>(),
        database.prepare(sitemapStateQuery('ec_pages', 'pages')).first<SitemapState>(),
      ]);

      if ((posts?.count ?? 0) > 0) {
        entries.push(sitemapEntry(origin, 'sitemap-posts.xml', posts?.lastmod));
      }
      if ((pages?.count ?? 0) > 0) {
        entries.push(sitemapEntry(origin, 'sitemap-pages.xml', pages?.lastmod));
      }
    } catch {
      // Keep the static website sitemap available if the CMS database is unavailable.
    }
  }

  return new Response([
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries,
    '</sitemapindex>',
  ].join('\n'), {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=300',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}

async function createStaticSitemap(
  request: Request,
  assets?: AssetsBinding,
  database?: D1Database,
) {
  if (!assets?.fetch) return null;

  const response = await assets.fetch(request);
  if (!response.ok || !database) return response;

  try {
    const published = await database
      .prepare(`
        SELECT slug
        FROM ec_posts
        WHERE status = 'published' AND deleted_at IS NULL
      `)
      .all<{ slug: string }>();
    const cmsSlugs = new Set((published.results ?? []).map((row) => row.slug));
    if (!cmsSlugs.size) return response;

    const xml = await response.text();
    const filtered = xml.replace(/\s*<url>[\s\S]*?<loc>([^<]+)<\/loc>[\s\S]*?<\/url>/g, (block, loc) => {
      try {
        const pathname = new URL(loc).pathname.replace(/\/$/, '');
        const match = pathname.match(/^\/blog\/([^/]+)$/);
        return match && cmsSlugs.has(decodeURIComponent(match[1])) ? '' : block;
      } catch {
        return block;
      }
    });
    const headers = new Headers(response.headers);
    headers.set('Cache-Control', 'public, max-age=300');
    headers.delete('Content-Length');
    return new Response(filtered, { status: response.status, headers });
  } catch {
    return response;
  }
}

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname, search } = context.url;
  const normalizedPathname = pathname.endsWith('/') && pathname !== '/' ? pathname.slice(0, -1) : pathname;
  const publicHosts = new Set(['optimaalgroeien.nl', 'www.optimaalgroeien.nl']);
  const canonicalOrigin = 'https://optimaalgroeien.nl';
  const forwardedProtocol = context.request.headers.get('x-forwarded-proto');

  // EmDash owns /sitemap-{collection}.xml. Keep Astro's static sitemap file
  // available and add CMS sitemaps to the index only when they contain content.
  if (pathname === '/sitemap-0.xml') {
    const assets = (cloudflareEnv as Record<string, unknown>).ASSETS as AssetsBinding | undefined;
    const database = (cloudflareEnv as Record<string, unknown>).EMDASH_DB as D1Database | undefined;
    const sitemap = await createStaticSitemap(context.request, assets, database);
    if (sitemap) return sitemap;
  }

  if (pathname === '/sitemap-index.xml') {
    const database = (cloudflareEnv as Record<string, unknown>).EMDASH_DB as D1Database | undefined;
    return createSitemapIndex(canonicalOrigin, database);
  }

  const redirectTo = (targetPath: string) => {
    const targetUrl = new URL(targetPath, canonicalOrigin);
    targetUrl.search = search;
    return context.redirect(targetUrl.toString(), 301);
  };

  const legacyRedirects: Record<string, string> = {
    '/high-ticket-closing-agency': '/leadmachine/',
    '/acquisitie-bureau': '/oplossingen/lead-generatie/',
    '/acquisitie-uitbesteden': '/oplossingen/lead-generatie/',
    '/b2b-leadgeneratie': '/oplossingen/lead-generatie/',
    '/sales-training': '/business-coaching/',
    '/trainingen': '/business-coaching/',
    '/business-coach': '/business-coaching/',
    '/sales-ondersteuning': '/leadmachine/',
    '/contentmarketing': '/content-marketing/',
    '/conversie-optimalisatie': '/oplossingen/marketing/',
    '/digital-growth-agency': '/oplossingen/',
    '/full-service-marketing-bureau': '/oplossingen/marketing/',
    '/goedkope-seo': '/seo/',
    '/groeistrategie': '/oplossingen/strategie/',
    '/sales-bedrijf': '/leadmachine/',
    '/seo-expert': '/seo/',
    '/seo-ondersteuning': '/seo/',
    '/website-teksten-laten-schrijven': '/content-marketing/',
    '/blog/de-opkomst-van-ai-agents': '/blog/de-opkomst-van-ai-agents-een-revolutie-voor-jouw-bedrijf/',
    '/blog/waarom-is-personal-branding-relevant': '/blog/waarom-is-personal-branding-relevant-voor-jouw-bedrijf-en-waar-moet-ik-beginnen/',
    '/brand-marketing': '/oplossingen/branding/',
    '/scale-up-bedrijf': '/oplossingen/strategie/',
    '/vacatures/allround-marketeer': '/over-ons/',
    '/vacatures/copywriter': '/over-ons/',
    '/vacatures/accountmanager-binnendienst': '/over-ons/',
    '/klantcase/van-weggezakt-naar-nummer-1-in-3-maanden-bij-plintenfabriek': '/blog/klantcase-plintenfabriek/',
    '/klantcase/150-omzetgroei-uit-new-business-bij-veldkamp': '/blog/klantcase-veldkamp/',
    '/klantcase/400-meer-leads-in-slechts-3-maanden-bij-equans': '/blog/klantcase-equans/',
    '/klantcase/150-groei-in-recruitment-en-nr-1-in-seo-bij-farrow-dutch': '/klantcases/',
    '/klantcase/34-groei-in-korte-tijd': '/klantcases/',
    '/klantcase/35-internationale-groei-in-b2b-bij-carbify': '/klantcases/',
    '/klantcase/succesvol-verkocht-gevoel-op-aruba-bij-paradera-park': '/klantcases/',
  };

  if (pathname === '/ai-analyse' || pathname === '/ai-analyse/') {
    return redirectTo('/ai-scan/');
  }

  if (pathname === '/sitemap.xml') {
    return redirectTo('/sitemap-index.xml');
  }

  if (
    pathname === '/algemene-voorwaarden' ||
    pathname === '/algemenevoorwaarden' ||
    pathname === '/algemenevoorwaarden/' ||
    pathname === '/voorwaarden' ||
    pathname === '/voorwaarden/'
  ) {
    return redirectTo('/algemene-voorwaarden/');
  }

  if (
    pathname === '/privacybeleid' ||
    pathname === '/privacy-beleid' ||
    pathname === '/privacy-beleid/' ||
    pathname === '/privacy' ||
    pathname === '/privacy/'
  ) {
    return redirectTo('/privacybeleid/');
  }

  const legacyTarget = legacyRedirects[normalizedPathname];
  if (legacyTarget) {
    return redirectTo(legacyTarget);
  }

  if (
    publicHosts.has(context.url.hostname) &&
    (context.url.hostname !== 'optimaalgroeien.nl' ||
      context.url.protocol !== 'https:' ||
      forwardedProtocol === 'http')
  ) {
    return redirectTo(`${pathname}${search}`);
  }

  return next();
});
