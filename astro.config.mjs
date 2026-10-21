// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { SHOW_COACHES } from './src/flags.mjs';

export default defineConfig({
  site: 'https://www.stoughtongymnastics.com',
  output: 'static',
  trailingSlash: 'never',
  // "file" output (class-schedule.html) keeps the original Wix URLs without trailing slashes.
  build: { format: 'file' },
  integrations: [
    sitemap({
      filter: (page) =>
        !/\/404(\.html)?$/.test(page) && (SHOW_COACHES || !/\/coach-info(\.html)?$/.test(page)),
    }),
  ],
  vite: { plugins: [tailwindcss()] },
});
