import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';
// Si usas Tailwind 4 y quieres que se procese en tests (opcional pero recomendado)
import tailwindcss from '@tailwindcss/vite'; 

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), 
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    // Asegúrate de que esta ruta sea correcta según tu estructura
    include: ['src/**/*.{test,spec}.{js,jsx,ts,tsx}'], 
    exclude: ['**/tests-e2e/**', '**/node_modules/**'],
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});