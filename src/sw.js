// 自定义Service Worker - 支持热更新
const CACHE_NAME = 'react-pwa-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.webmanifest'
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

  // 处理测试推送消息
  if (event.data && event.data.type === 'TEST_PUSH_MESSAGE') {
    console.log('Service Worker收到测试推送消息:', event.data);
    console.log('Service Worker状态:', {
      registration: !!self.registration,
      permission: 'Service Worker中无法直接访问Notification.permission'
    });
    
    const { title, body } = event.data;
    
    try {
      const notificationPromise = self.registration.showNotification(title, {
        body,
        icon: '/pwa-192x192.png',
        badge: '/pwa-192x192.png',
        tag: 'test-message',
        data: {
          url: '/',
          timestamp: Date.now()
        },
        actions: [
          {
            action: 'view',
            title: '查看',
            icon: '/pwa-192x192.png'
          },
          {
            action: 'dismiss',
            title: '忽略',
            icon: '/pwa-192x192.png'
          }
        ],
        requireInteraction: false,
        silent: false,
        vibrate: [200, 100, 200]
      });
      
      notificationPromise.then(() => {
        console.log('通知显示成功');
      }).catch((error) => {
        console.error('通知显示失败:', error);
      });
    } catch (error) {
      console.error('创建通知时出错:', error);
    }
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

// 推送消息处理
self.addEventListener('push', (event) => {
  console.log('收到推送消息:', event);
  
  let notificationData = {
    title: '新消息',
    body: '您有一条新消息',
    icon: '/pwa-192x192.png',
    badge: '/pwa-192x192.png',
    tag: 'default',
    data: {
      url: '/',
      timestamp: Date.now()
    }
  };

  // 如果有推送数据，使用推送数据
  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = {
        ...notificationData,
        ...data
      };
    } catch (error) {
      console.error('解析推送数据失败:', error);
      notificationData.body = event.data.text();
    }
  }

  const options = {
    body: notificationData.body,
    icon: notificationData.icon,
    badge: notificationData.badge,
    tag: notificationData.tag,
    data: notificationData.data,
    actions: [
      {
        action: 'view',
        title: '查看',
        icon: '/pwa-192x192.png'
      },
      {
        action: 'dismiss',
        title: '忽略',
        icon: '/pwa-192x192.png'
      }
    ],
    requireInteraction: false,
    silent: false,
    vibrate: [200, 100, 200]
  };

  event.waitUntil(
    self.registration.showNotification(notificationData.title, options)
  );
});

// 通知点击处理
self.addEventListener('notificationclick', (event) => {
  console.log('通知被点击:', event);
  
  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  // 默认行为或点击"查看"按钮
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clients) => {
      // 如果已经有窗口打开，聚焦到该窗口
      if (clients.length > 0) {
        clients[0].focus();
        // 如果需要，可以发送消息到页面
        clients[0].postMessage({
          type: 'NOTIFICATION_CLICKED',
          data: event.notification.data,
          tag: event.notification.tag
        });
      } else {
        // 如果没有窗口打开，打开新窗口
        self.clients.openWindow(event.notification.data?.url || '/');
      }
    })
  );
});

// 通知关闭处理
self.addEventListener('notificationclose', (event) => {
  console.log('通知被关闭:', event);
  // 可以在这里添加统计或清理逻辑
});
