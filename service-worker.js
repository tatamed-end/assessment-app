const CACHE_NAME = 'assessment-system-cache-v1';

// オフラインで使用したいすべてのリソースをリスト化
// 外部ライブラリもキャッシュに含めることでオフラインでの動作を保証します
const CACHE_ASSETS = [
    '/', // ルートURL (通常はindex.htmlを指す)
    '/index.html',
    '/app.js',
    '/manifest.json',
    // 外部CSS/JSライブラリ (オフラインで動かすにはこれもキャッシュが必要です)
    'https://cdn.tailwindcss.com',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css',
    'https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&display=swap'
    // 実際に使用しているフォントファイル (今回はURLに含まれているため省略)
];

// サービスワーカーがインストールされた時 (初回ロード時)
self.addEventListener('install', event => {
    console.log('Service Worker: Installed. Start caching static assets.');
    // キャッシュ処理
    event.waitUntil(
        caches.open(CACHE_NAME) // キャッシュ名で新しいキャッシュストレージを開く
            .then(cache => {
                console.log('Service Worker: Caching files...');
                // 定義したファイルをすべてキャッシュに追加
                return cache.addAll(CACHE_ASSETS);
            })
            // インストールが完了する前にWorkerがアクティブになるのを防ぐ
            .then(() => self.skipWaiting())
            .catch(err => {
                console.error('Service Worker: Caching failed.', err);
            })
    );
});

// サービスワーカーがアクティベートされた時 (キャッシュのクリーンアップ)
self.addEventListener('activate', event => {
    console.log('Service Worker: Activated. Cleaning up old caches.');
    // 古いキャッシュの削除
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    // 現在のキャッシュ名と一致しない古いキャッシュを削除
                    if (cache !== CACHE_NAME) {
                        console.log('Service Worker: Clearing old cache:', cache);
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
    // アクティベート後にクライアントの制御をすぐに行う
    return self.clients.claim();
});

// リソースの取得 (Fetch) イベント: ブラウザがリソースを要求した時
self.addEventListener('fetch', event => {
    // ネットワークファースト & キャッシュフォールバック戦略
    event.respondWith(
        // 1. ネットワークから取得を試みる
        fetch(event.request)
            .then(response => {
                // ネットワークからの応答が成功した場合、それを返す前にキャッシュを更新する (Cache-and-update)
                // ただし、レスポンスが有効な場合のみ（ステータス200、'basic'または'cors'タイプ）
                const responseToCache = response.clone();
                if (response.status === 200) {
                    caches.open(CACHE_NAME)
                        .then(cache => {
                            // キャッシュ可能なリクエストのみを保存
                            if (event.request.method === 'GET') {
                                // console.log('Service Worker: Fetch successful. Updating cache for:', event.request.url);
                                cache.put(event.request, responseToCache);
                            }
                        });
                }
                return response;
            })
            // 2. ネットワーク接続がない、または失敗した場合はキャッシュから取得する
            .catch(() => {
                // console.log('Service Worker: Network failed, checking cache for:', event.request.url);
                return caches.match(event.request);
            })
    );
});