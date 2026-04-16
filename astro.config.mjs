import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@tailwindcss/vite';
import vercel from '@astrojs/vercel';

export default defineConfig({
  site: 'https://migym-app.vercel.app/',
  base: '/',
  trailingSlash: 'ignore',
  integrations: [react()],
  adapter: vercel(),
  output: 'server',
  prefetch: {
    prefetchAll: false,
    defaultStrategy: 'hover'
  },

  vite: {
    plugins: [tailwind()],
    // Hemos eliminado el objeto 'build' y 'manualChunks' de aquí
  },
});