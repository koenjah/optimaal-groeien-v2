import { defineMiddleware } from 'astro:middleware';
import { env as cloudflareEnv } from 'cloudflare:workers';

type AssetsBinding = {
  fetch(request: Request): Promise<Response>;
};

export const onRequest = defineMiddleware((context, next) => {
  const { pathname, search } = context.url;
  const normalizedPathname = pathname.endsWith('/') && pathname !== '/' ? pathname.slice(0, -1) : pathname;
  const publicHosts = new Set(['optimaalgroeien.nl', 'www.optimaalgroeien.nl']);
  const canonicalOrigin = 'https://optimaalgroeien.nl';
  const forwardedProtocol = context.request.headers.get('x-forwarded-proto');

  // EmDash owns /sitemap-{collection}.xml. Keep Astro's existing sitemap files
  // available because their names also match that dynamic CMS route.
  if (pathname === '/sitemap-index.xml' || pathname === '/sitemap-0.xml') {
    const assets = (cloudflareEnv as Record<string, unknown>).ASSETS as AssetsBinding | undefined;
    if (assets?.fetch) {
      const assetUrl = new URL(context.request.url);
      if (publicHosts.has(assetUrl.hostname)) assetUrl.hostname = 'optimaal-groeien.koenjah.workers.dev';
      return assets.fetch(new Request(assetUrl, context.request));
    }
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
