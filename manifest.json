// キャッシュ名: v2に更新し、新しいキャッシュを強制的にインストールさせる
const CACHE_NAME = 'assessment-system-cache-v2';

// ★修正点: 外部ライブラリのURLを削除し、アプリ本体ファイルのみをキャッシュ対象とします。
const CACHE_ASSETS = [
    './', // index.htmlへの相対参照
    './index.html',
    './app.js',
    './service-worker.js',
    './manifest.json',
    // 外部ライブラリ（Tailwind, FontAwesomeなど）はキャッシュから除外
];

// サービスワーカーがインストールされた時 (初回ロード時)
self.addEventListener('install', event => {
    console.log('Service Worker: Installed. Start caching static assets.');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Service Worker: Caching files...');
                // ここでキャッシュエラーが発生しないように、リストを最小化
                return cache.addAll(CACHE_ASSETS);
            })
            .then(() => self.skipWaiting())
            .catch(err => {
                // ここにエラーが出る場合、パスかファイル名が間違っています
                console.error('Service Worker: Caching failed. Check file paths.', err);
            })
    );
});

// サービスワーカーがアクティベートされた時 (キャッシュのクリーンアップ)
self.addEventListener('activate', event => {
    console.log('Service Worker: Activated. Cleaning up old caches.');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    // v2以外の古いキャッシュを削除
                    if (cache !== CACHE_NAME) {
                        console.log('Service Worker: Clearing old cache:', cache);
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
    return self.clients.claim();
});

// リソースの取得 (Fetch) イベント: キャッシュファースト戦略
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // 1. キャッシュに見つかった場合はそれを返す
                if (response) {
                    return response;
                }
                // 2. キャッシュにない場合はネットワークから取得する
                return fetch(event.request);
            })
    );
});
