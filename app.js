// サービスワーカーがブラウザでサポートされているかを確認
if ('serviceWorker' in navigator) {
    // Webアプリが完全にロードされた後に登録処理を行う
    window.addEventListener('load', function() {
        // service-worker.js ファイルを登録
        // 注意: サービスワーカーファイルは、Webサーバーのルートディレクトリに配置することを推奨します
        navigator.serviceWorker.register('/service-worker.js').then(function(registration) {
            // 登録成功
            console.log('ServiceWorker registration successful with scope: ', registration.scope);
        }, function(err) {
            // 登録失敗
            console.log('ServiceWorker registration failed: ', err);
        });
    });
} else {
    console.log('Service Workers are not supported in this browser.');
}