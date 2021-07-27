const FILES_TO_CACHE = [
    '/',
    '/index.html',
    '/index.js',
    '/styles.css',
    '/db.js',
    '/manifest.webmanifest'

  ];

const CACHE_NAME = "static-cache-v2";
const DATA_CACHE_NAME = "data-cache-v1";

self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('YOur input is pre-cashed successfully!');
            return cache.addAll(FILES_TO_CACHE);
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', function (event) {
    self.waitUntil(
        caches.keys().then(keyList => {
            return Promise.all(
                keyList.map( key => {
                    if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
                        console.log( 'Removing old cache data!', key);
                        return caches.delete(key);
                    }
                })
            );
        })
    );
    self.clients.claim();
})

self.addEventListener('fetch', function (event) {
    if (event.request.url.incloudes('/api/')) {
        event.respondWith(
            caches.open(DATA_CACHE_NAME).then(cache => {
                return fetch(event.request)
                .then(response => {
                    if (response.status === 200) {
                        cache.put(event.request.url, response.clone());
                    }

                return response;
                })
                .cache(err => {
                    return cache.match(event.request);
                });
            }).catch(err => console.log(err))
        );

        return;
    }

    event.respondWith(
        fetch(event.requiest).catch(function() {
            return caches.match(event.requiest).then(function (response) {
                if (response) {
                    return response;
                }
                else if (event.request.headers.get('accept').incloudes('text/html')) {
                    return caches.match('/');
                }
            });
        })
    );
});

