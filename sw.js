// 사업자관리노트 서비스 워커 — network-first 캐싱
// 새 버전을 배포할 때는 CACHE 이름의 버전 숫자만 올려주세요 (예: v1 -> v2)
const CACHE = 'biz-note-v1';
const PRECACHE_URLS = [
  './',
  './biz-note.html',
  './manifest.json'
];

// 설치: 핵심 파일을 미리 캐싱
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(PRECACHE_URLS).catch(() => {}))
  );
});

// 활성화: 이전 버전 캐시 정리
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// 요청 처리: network-first (온라인이면 최신 버전, 실패하면 캐시된 버전)
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request)
      .then(response => {
        const copy = response.clone();
        caches.open(CACHE).then(cache => cache.put(event.request, copy)).catch(() => {});
        return response;
      })
      .catch(() => caches.match(event.request).then(cached => cached || caches.match('./biz-note.html')))
  );
});
