const CACHE_NAME = "anoma-shell-v1";
const SHELL_URLS = ["/", "/offline"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_URLS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Only cache GET requests for navigation and static assets
  if (request.method !== "GET") return;

  // Skip API routes and Convex
  const url = new URL(request.url);
  if (url.pathname.startsWith("/api/") || url.hostname.includes("convex")) {
    return;
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        // Cache successful navigation and static asset responses
        if (response.ok && (request.mode === "navigate" || url.pathname.match(/\.(js|css|png|svg|ico|woff2?)$/))) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(() => {
        // Offline fallback: serve cached shell for navigation requests
        if (request.mode === "navigate") {
          return caches.match("/") || new Response("Offline", { status: 503 });
        }
        return caches.match(request);
      })
  );
});
