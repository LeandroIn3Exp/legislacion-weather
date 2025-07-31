const CACHE_NAME = "clima-quito-v1";
const ASSETS = [
  "./",
  "./index.html",
  "./styles/main.css",
  "./styles/chatbot.css",
  "./src/main.js",
  "./assets/web-app-manifest-192x192.png",
  "./assets/web-app-manifest-512x512.png",
  "./assets/favicon.ico",
  "./manifest.json"
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS))
      .catch((err) => console.error("Error al cachear recursos:", err))
  );
});

self.addEventListener("fetch", (e) => {
  e.respondWith(
    fetch(e.request)
      .then((response) => {
        // Cachear respuestas exitosas
        if (e.request.method === "GET") {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then((cache) => cache.put(e.request, responseToCache));
        }
        return response;
      })
      .catch(() => caches.match(e.request))
  );
});