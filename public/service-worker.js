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

// install
self.addEventListener('install', function(evnt) {
    evnt.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('YOur input is pre-cashed successfully!');
            return cache.addAll(FILES_TO_CACHE);
        })
    );
    self.skipWaiting();
});

// activate
self.addEventListener('activate', function (evnt) {
    evnt.waitUntil(
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

// fetch
self.addEventListener('fetch', function (evnt) {
    if (evnt.request.url.includes('/api/')) {
        evnt.respondWith(
            caches.open(DATA_CACHE_NAME).then(cache => {
                return fetch(evnt.request)
                .then(response => {
                    if (response.status === 200) {
                        cache.put(evnt.request.url, response.clone());
                    }

                return response;
                })
                .catch(err => {
                    return cache.match(evnt.request);
                });
            }).catch(err => console.log(err))
        );

        return;
    }

    evnt.respondWith(
        fetch(evnt.request).catch(function() {
            return caches.match(evnt.request).then(function (response) {
                if (response) {
                    return response;
                }
                else if (evnt.request.headers.get('accept').includes('text/html')) {
                    return caches.match('/');
                }
            });
        })
    );
});

