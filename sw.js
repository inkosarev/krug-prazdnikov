// Офлайн-кэш и быстрые обновления.
// Страница — всегда сверка с сервером (cache: 'no-cache', мимо HTTP-кэша браузера), без сети — из кэша.
// Свои файлы (иконки, манифест) — из кэша, но в фоне обновляются: следующее открытие уже с новыми.
// Шрифты Google — сначала кэш. При изменении списка предзагрузки или стратегии поднять VERSION.
const VERSION = 'v5'
const CACHE = `krug-${VERSION}`
const PRECACHE = ['./', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png']

self.addEventListener('install', e => {
    // cache: 'reload' — предзагрузка мимо HTTP-кэша, чтобы не положить в новый кэш старые файлы.
    e.waitUntil(caches.open(CACHE)
        .then(c => c.addAll(PRECACHE.map(u => new Request(u, { cache: 'reload' }))))
        .then(() => self.skipWaiting()))
})

self.addEventListener('activate', e => {
    e.waitUntil(caches.keys()
        .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
        .then(() => self.clients.claim()))
})

function put(req, res) {
    if (res.ok || res.type === 'opaque') { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)) }
    return res
}

self.addEventListener('fetch', e => {
    const req = e.request
    if (req.method !== 'GET') return
    if (req.mode === 'navigate') {
        e.respondWith(fetch(req, { cache: 'no-cache' })
            .then(res => put('./', res))
            .catch(() => caches.match('./')))
        return
    }
    if (new URL(req.url).origin === location.origin) {
        // Свои файлы: ответ из кэша сразу, свежая копия — в фоне.
        const fresh = fetch(req, { cache: 'no-cache' }).then(res => put(req, res))
        e.respondWith(caches.match(req).then(hit => hit || fresh))
        e.waitUntil(fresh.catch(() => {}))
        return
    }
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => put(req, res))))
})
