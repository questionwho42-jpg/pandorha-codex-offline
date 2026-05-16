const CACHE_NAME = "pandorha-engine-v2026-05-16";
const PRECACHE_ASSETS = ["/", "/index.html", "/favicon.ico"];

// Instalação do Service Worker e precacheamento de arquivos base
self.addEventListener("install", (event) => {
	event.waitUntil(
		caches
			.open(CACHE_NAME)
			.then((cache) => {
				return cache.addAll(PRECACHE_ASSETS);
			})
			.then(() => {
				return self.skipWaiting();
			}),
	);
});

// Ativação e limpeza de caches antigos
self.addEventListener("activate", (event) => {
	event.waitUntil(
		caches
			.keys()
			.then((cacheNames) => {
				return Promise.all(
					cacheNames.map((cacheName) => {
						if (cacheName !== CACHE_NAME) {
							return caches.delete(cacheName);
						}
					}),
				);
			})
			.then(() => {
				return self.clients.claim();
			}),
	);
});

// Interceptação de requisições com cache estratégico
self.addEventListener("fetch", (event) => {
	const requestUrl = new URL(event.request.url);

	// Interceptar apenas requisições do próprio domínio (assets locais)
	if (requestUrl.origin !== self.location.origin) {
		return;
	}

	// Ignorar requisições de desenvolvimento do Vite (HMR) e extensões do Chrome
	if (
		requestUrl.pathname.includes("@vite") ||
		requestUrl.pathname.includes("node_modules")
	) {
		return;
	}

	// Estratégia de cache baseada no tipo de asset
	if (requestUrl.pathname.includes("/assets/")) {
		// Assets do Vite com hash de conteúdo no nome: Cache-First definitivo
		event.respondWith(
			caches.match(event.request).then((cachedResponse) => {
				if (cachedResponse) {
					return cachedResponse;
				}

				return fetch(event.request).then((networkResponse) => {
					if (!networkResponse || networkResponse.status !== 200) {
						return networkResponse;
					}

					return caches.open(CACHE_NAME).then((cache) => {
						cache.put(event.request, networkResponse.clone());
						return networkResponse;
					});
				});
			}),
		);
	} else {
		// Outros assets locais (index.html, rotas, favicons): Stale-While-Revalidate
		event.respondWith(
			caches.match(event.request).then((cachedResponse) => {
				const networkFetch = fetch(event.request)
					.then((networkResponse) => {
						if (networkResponse && networkResponse.status === 200) {
							caches.open(CACHE_NAME).then((cache) => {
								cache.put(event.request, networkResponse.clone());
							});
						}
						return networkResponse;
					})
					.catch(() => {
						// Fallback silencioso em caso de falha de rede total
						return cachedResponse;
					});

				return cachedResponse || networkFetch;
			}),
		);
	}
});
