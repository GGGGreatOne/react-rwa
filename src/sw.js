// 自定义Service Worker - 支持热更新
const CACHE_NAME = 'react-pwa-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
];

// 安装事件 - 缓存资源
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        // 立即激活新的Service Worker
        return self.skipWaiting();
      })
  );
});

// 激活事件 - 清理旧缓存并接管页面
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      // 清理旧缓存
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // 立即接管所有页面
      self.clients.claim()
    ])
  );
});

// 拦截网络请求 - 网络优先策略，支持热更新
self.addEventListener('fetch', (event) => {
  // 对于API请求，使用网络优先策略
  if (event.request.url.includes('/api/') || event.request.method !== 'GET') {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          // 网络失败时尝试从缓存获取
          return caches.match(event.request);
        })
    );
    return;
  }

  // 对于静态资源，使用缓存优先策略
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // 如果缓存中有响应，先返回缓存的响应
        if (cachedResponse) {
          // 在后台更新缓存
          fetch(event.request).then((response) => {
            if (response && response.status === 200) {
              const responseToCache = response.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, responseToCache);
              });
            }
          }).catch(() => {
            // 网络更新失败，继续使用缓存
          });
          
          return cachedResponse;
        }
        
        // 缓存中没有，从网络获取
        return fetch(event.request).then((response) => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return response;
        });
      })
      .catch(() => {
        // 如果网络和缓存都失败，返回离线页面
        if (event.request.destination === 'document') {
          return caches.match('/index.html');
        }
      })
  );
});

// 消息处理 - 支持热更新
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  // 检查更新状态
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({
      type: 'VERSION_INFO',
      version: CACHE_NAME,
      timestamp: Date.now()
    });
  }
});

// 定期检查更新
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(checkForUpdates());
  }
});

// 检查更新函数
async function checkForUpdates() {
  try {
    // 这里可以添加检查服务器版本信息的逻辑
    // 例如：fetch('/api/version').then(response => response.json())
    console.log('检查更新中...');
  } catch (error) {
    console.error('检查更新失败:', error);
  }
}
