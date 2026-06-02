import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import cloudflare from '@astrojs/cloudflare';
import { fileURLToPath } from 'node:url';

const enableEmdash = process.env.ENABLE_EMDASH === 'true';

const integrations = [
  react(),
  sitemap({
    filter: (page) => !page.endsWith('/admin/') && !page.endsWith('/404/'),
  }),
];

if (enableEmdash) {
  const [{ default: emdash }, { d1, r2 }] = await Promise.all([
    import('emdash/astro'),
    import('@emdash-cms/cloudflare'),
  ]);

  integrations.push(
    emdash({
      database: d1({ binding: 'EMDASH_DB' }),
      storage: r2({ binding: 'MEDIA' }),
    }),
  );
}

export default defineConfig({
  site: 'https://optimaalgroeien.nl',
  integrations,
  output: enableEmdash ? 'server' : 'static',
  adapter: cloudflare(),
  vite: {
    define: {
      'process.env.ENABLE_EMDASH': JSON.stringify(enableEmdash ? 'true' : 'false'),
    },
    resolve: {
      alias: enableEmdash
        ? {}
        : {
            emdash: fileURLToPath(new URL('./src/lib/emdash-stub.ts', import.meta.url)),
          },
    },
    plugins: [tailwindcss()],
  },
});
