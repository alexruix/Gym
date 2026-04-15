import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@tailwindcss/vite';
import vercel from '@astrojs/vercel';

export default defineConfig({
  site: 'https://migym-app.vercel.app',
  integrations: [react()],
  adapter: vercel(),
  output: 'server',
  
  vite: {
    plugins: [tailwind()],
  },
});