importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.4.1/workbox-sw.js');

if (workbox) {
  console.log('[MiGym SW] Workbox cargado con éxito');

  // Skip waiting and claim clients to ensure fast updates
  workbox.core.skipWaiting();
  workbox.core.clientsClaim();

  // 1. ESTRATEGIA: Stale-While-Revalidate (Fuentes y Estilos Core)
  // Útil para que la app abra instantáneamente incluso con señal pobre.
  workbox.routing.registerRoute(
    ({request}) => request.destination === 'style' || request.destination === 'font',
    new workbox.strategies.StaleWhileRevalidate({
      cacheName: 'migym-core-assets',
    })
  );

  // 2. ESTRATEGIA: Cache-First (Scripts & Imágenes)
  // Las imágenes y assets de JS cambian poco (Astro genera hashes).
  workbox.routing.registerRoute(
    ({request}) => request.destination === 'script' || request.destination === 'image',
    new workbox.strategies.CacheFirst({
      cacheName: 'migym-media-cache',
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 100,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 días
        }),
      ],
    })
  );

  // 3. ESTRATEGIA: Network-First (Páginas / Navegación)
  // Intentamos siempre ir a la red para datos frescos (Agenda, Alumnos).
  // Si falla (offline), servimos la página de fallback industrial.
  const networkFirstHandler = new workbox.strategies.NetworkFirst({
    cacheName: 'migym-dynamic-pages',
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 50,
      }),
    ],
  });

  workbox.routing.registerRoute(
    ({request}) => request.mode === 'navigate',
    async (params) => {
      try {
        return await networkFirstHandler.handle(params);
      } catch (error) {
        // Fallback a la página offline industrial
        return caches.match('/offline');
      }
    }
  );

  // Precaching de la página offline para asegurar que esté disponible
  self.addEventListener('install', (event) => {
    const offlinePage = new Request('/offline');
    event.waitUntil(
      fetch(offlinePage).then((response) => {
        return caches.open('migym-offline-fallback').then((cache) => {
          return cache.put(offlinePage, response);
        });
      })
    );
  });

  // 4. PERIODIC BACKGROUND SYNC (Inteligencia Silenciosa 2026)
  // Se ejecuta en segundo plano para calentar el cache de la agenda.
  self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'warm-up-agenda') {
      console.log('[MiGym SW] Ejecutando sincronización periódica: warm-up-agenda');
      event.waitUntil(
        fetch('/profesor/agenda').then(response => {
           return caches.open('migym-dynamic-pages').then(cache => {
             return cache.put('/profesor/agenda', response);
           });
        })
      );
    }
  });

  // 5. BACKGROUND SYNC (Resiliencia de Acciones)
  // Reintenta acciones fallidas cuando recuperamos la señal.
  self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-mutations') {
      console.log('[MiGym SW] Reintentando acciones pendientes...');
      // Aquí iría la lógica de replay de IndexedDB
    }
  });

} else {
  console.log('[MiGym SW] Fallo al cargar Workbox');
}
