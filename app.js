// サービスワーカーがブラウザでサポートされているかを確認
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        // ★修正点: パスを './service-worker.js' に変更し、GitHub Pagesのサブディレクトリ環境での登録エラーを回避します。
        navigator.serviceWorker.register('./service-worker.js').then(function(registration) {
            console.log('ServiceWorker registration successful with scope: ', registration.scope);
        }, function(err) {
            console.log('ServiceWorker registration failed: ', err);
        });
    });
} else {
    console.log('Service Workers are not supported in this browser.');
}
