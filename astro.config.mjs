import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@tailwindcss/vite';
import vercel from '@astrojs/vercel';

export default defineConfig({
  integrations: [react()],
  adapter: vercel(),
  output: 'server',
  
  vite: {
    plugins: [tailwind()],
    server: {
      hmr: {
        protocol: 'ws',
        host: 'localhost',
      },
    },

  },
});