const CACHE_NAME = "pandorha-engine-offline-v2";
const CACHE_PREFIX = "pandorha-engine-offline-";
const APP_SHELL_URLS = ["/", "/index.html"];

self.addEventListener("install", (event) => {
	event.waitUntil(
		caches
			.open(CACHE_NAME)
			.then((cache) => cache.addAll(APP_SHELL_URLS))
			.then(() => self.skipWaiting())
			.catch(() => undefined),
	);
});

self.addEventListener("activate", (event) => {
	event.waitUntil(
		caches
			.keys()
			.then((keys) =>
				Promise.all(
					keys
						.filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
						.map((key) => caches.delete(key)),
				),
			)
			.then(() => self.clients.claim()),
	);
});

self.addEventListener("fetch", (event) => {
	const request = event.request;
	if (request.method !== "GET") {
		return;
	}

	const requestUrl = new URL(request.url);
	if (requestUrl.origin !== self.location.origin) {
		return;
	}

	if (request.mode === "navigate") {
		event.respondWith(handleNavigationRequest(request));
		return;
	}

	event.respondWith(handleRuntimeRequest(request));
});

async function handleNavigationRequest(request) {
	try {
		const response = await fetch(request);
		const cache = await caches.open(CACHE_NAME);
		await cache.put("/", response.clone());
		return response;
	} catch {
		return (
			(await caches.match(request)) ??
			(await caches.match("/")) ??
			(await caches.match("/index.html")) ??
			Response.error()
		);
	}
}

async function handleRuntimeRequest(request) {
	try {
		const response = await fetch(request);
		if (response.status === 200) {
			const cache = await caches.open(CACHE_NAME);
			await cache.put(request, response.clone());
		}
		return response;
	} catch {
		const cached = await caches.match(request);
		return cached ?? Response.error();
	}
}
