import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  site: 'https://optimaalgroeien.nl',
  integrations: [
    react(),
    sitemap({
      filter: (page) => !page.endsWith('/admin/') && !page.endsWith('/404/'),
    }),
  ],
  output: 'static',
  adapter: cloudflare(),
  vite: {
    plugins: [tailwindcss()],
  },
});
