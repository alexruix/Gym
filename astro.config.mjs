import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import vercel from '@astrojs/vercel';

export default defineConfig({
  site: 'https://migym-app.vercel.app',
  trailingSlash: 'ignore',
  integrations: [react()],
  adapter: vercel({
    webAnalytics: {
      enabled: true
    }
  }),
  output: 'server',
  prefetch: {
    prefetchAll: false,
    defaultStrategy: 'hover'
  },

  vite: {
    plugins: [tailwindcss()],
    server: {
      origin: 'https://migym-app.vercel.app'
    }
  },
});