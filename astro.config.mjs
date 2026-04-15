import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@tailwindcss/vite';
import vercel from '@astrojs/vercel';

export default defineConfig({
  site: 'https://migym-app.vercel.app',
  base: '/',
  integrations: [react()],
  adapter: vercel(),
  output: 'server',

  vite: {
    plugins: [tailwind()],
    // El objeto build debe ir aquí dentro para que Vite lo reconozca
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            // Esto separa las librerías pesadas en un archivo aparte (vendor.js)
            // permitiendo que el navegador las descargue en paralelo
            if (id.includes('node_modules')) {
              if (id.includes('react')) return 'vendor-react';
              if (id.includes('framer-motion')) return 'vendor-framer';
              if (id.includes('lucide-react')) return 'vendor-lucide';
              if (id.includes('@radix-ui')) return 'vendor-radix';
              return 'vendor-others';
            }
          },
        },
      },
      // Opcional: Aumenta el límite del warning si sabes que tus librerías son pesadas
      chunkSizeWarningLimit: 1000,
    },
  },
});