import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import cloudflare from '@astrojs/cloudflare';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const enableEmdash = process.env.ENABLE_EMDASH === 'true';
const siteOrigin = 'https://optimaalgroeien.nl';
const trackingPluginEntry = fileURLToPath(new URL('./src/plugins/og-tracking/plugin.ts', import.meta.url));
const trackingAdminEntry = fileURLToPath(new URL('./src/plugins/og-tracking/admin.tsx', import.meta.url));
const blogContentPath = fileURLToPath(new URL('./src/content/blog/', import.meta.url));
const staticBlogPages = readdirSync(blogContentPath)
  .filter((name) => name.endsWith('.md'))
  .map((name) => {
    const source = readFileSync(new URL(name, new URL('./src/content/blog/', import.meta.url)), 'utf8');
    const frontmatter = source.match(/^---\s*\n([\s\S]*?)\n---/);
    const slug = frontmatter?.[1].match(/^slug:\s*["']?([^"'\n]+)["']?\s*$/m)?.[1]?.trim()
      ?? name.replace(/\.md$/, '');
    return `${siteOrigin}/blog/${slug}/`;
  });

const integrations = [
  react(),
  sitemap({
    customPages: [`${siteOrigin}/blog/`, ...staticBlogPages],
    filter: (page) => {
      const pathname = new URL(page).pathname;
      return pathname !== '/beheer/'
        && pathname !== '/admin/'
        && pathname !== '/404/'
        && !pathname.startsWith('/_emdash/')
        && !pathname.startsWith('/cms-preview/')
        && !pathname.startsWith('/api/');
    },
  }),
];

if (enableEmdash) {
  const [{ default: emdash }, { d1, r2, access }] = await Promise.all([
    import('emdash/astro'),
    import('@emdash-cms/cloudflare'),
  ]);
  const accessTeamDomain = process.env.CF_ACCESS_TEAM_DOMAIN?.trim();
  const accessAudience = process.env.CF_ACCESS_AUDIENCE?.trim();

  integrations.push(
    emdash({
      database: d1({ binding: 'EMDASH_DB' }),
      storage: r2({ binding: 'MEDIA' }),
      admin: {
        logo: '/images/logo.png',
        siteName: 'Optimaal Groeien CMS',
        favicon: '/images/logo-icon.png',
      },
      plugins: [{
        id: 'og-tracking',
        version: '1.0.0',
        entrypoint: trackingPluginEntry,
        adminEntry: trackingAdminEntry,
        adminPages: [{ path: '/tracking', label: 'Google tracking', icon: 'chart-line' }],
      }],
      ...(accessTeamDomain
        ? {
            auth: access({
              teamDomain: accessTeamDomain,
              ...(accessAudience
                ? { audience: accessAudience }
                : { audienceEnvVar: 'CF_ACCESS_AUDIENCE' }),
              autoProvision: true,
              defaultRole: 50,
              syncRoles: true,
            }),
          }
        : {}),
    }),
  );
}

export default defineConfig({
  site: siteOrigin,
  integrations,
  output: enableEmdash ? 'server' : 'static',
  adapter: cloudflare(),
  vite: {
    define: {
      'process.env.ENABLE_EMDASH': JSON.stringify(enableEmdash ? 'true' : 'false'),
    },
    resolve: {
      alias: enableEmdash
        ? []
        : [
            {
              find: /^emdash$/,
              replacement: fileURLToPath(new URL('./src/lib/emdash-stub.ts', import.meta.url)),
            },
            {
              find: /^emdash\/runtime$/,
              replacement: fileURLToPath(new URL('./src/lib/emdash-runtime-stub.ts', import.meta.url)),
            },
          ],
    },
    plugins: [tailwindcss()],
  },
});
