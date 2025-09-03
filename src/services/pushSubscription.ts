// 推送订阅管理服务
export interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

// VAPID配置接口
interface VapidConfig {
  publicKey: string;
  privateKey: string;
  subject: string;
}

class PushSubscriptionService {
  private registration: ServiceWorkerRegistration | null = null;
  private vapidConfig: VapidConfig | null = null;

  constructor() {
    this.init();
    this.loadVapidConfig();
  }

  private async init() {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      try {
        this.registration = await navigator.serviceWorker.ready;
        console.log('Service Worker 已准备就绪');
      } catch (error) {
        console.error('Service Worker 初始化失败:', error);
      }
    }
  }

  private async loadVapidConfig() {
    try {
      const response = await fetch('/src/config/vapid.json');
      this.vapidConfig = await response.json();
      console.log('VAPID配置已加载');
    } catch (error) {
      console.warn('无法加载VAPID配置，将使用默认配置:', error);
      // 使用默认配置
      this.vapidConfig = {
        publicKey: 'BNcRdRSTGJOtTstkq6iu_BbYjSjuq26qjzO91qeBOGpeJVEj5l7u1baKVxRP0HeT5P8js5HXrWMTN1I3AIK1ZQ',
        privateKey: '',
        subject: 'mailto:your-email@example.com'
      };
    }
  }

  // 请求通知权限
  async requestNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.log('此浏览器不支持通知');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      console.log('通知权限已被拒绝');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (error) {
      console.error('请求通知权限失败:', error);
      return false;
    }
  }

  // 订阅推送服务
  async subscribeToPush(): Promise<PushSubscription | null> {
    if (!this.registration) {
      console.error('Service Worker 未注册');
      return null;
    }

    try {
      // 检查是否已订阅
      const existingSubscription = await this.registration.pushManager.getSubscription();
      if (existingSubscription) {
        console.log('已存在推送订阅');
        return this.convertSubscription(existingSubscription);
      }

      // 等待VAPID配置加载
      if (!this.vapidConfig) {
        await this.loadVapidConfig();
      }

      // 创建新的订阅 - 使用VAPID公钥
      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(this.vapidConfig!.publicKey)
      });

      console.log('推送订阅成功:', subscription);
      return this.convertSubscription(subscription);
    } catch (error) {
      console.error('推送订阅失败:', error);
      return null;
    }
  }

  // 取消订阅
  async unsubscribeFromPush(): Promise<boolean> {
    if (!this.registration) {
      return false;
    }

    try {
      const subscription = await this.registration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
        console.log('推送订阅已取消');
        return true;
      }
      return false;
    } catch (error) {
      console.error('取消推送订阅失败:', error);
      return false;
    }
  }

  // 获取当前订阅状态
  async getSubscriptionStatus(): Promise<{
    subscribed: boolean;
    subscription: PushSubscription | null;
  }> {
    if (!this.registration) {
      return { subscribed: false, subscription: null };
    }

    try {
      const subscription = await this.registration.pushManager.getSubscription();
      return {
        subscribed: !!subscription,
        subscription: subscription ? this.convertSubscription(subscription) : null
      };
    } catch (error) {
      console.error('获取订阅状态失败:', error);
      return { subscribed: false, subscription: null };
    }
  }

  // 转换订阅对象格式
  private convertSubscription(subscription: any): PushSubscription {
    return {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: this.arrayBufferToBase64(subscription.getKey('p256dh')),
        auth: this.arrayBufferToBase64(subscription.getKey('auth'))
      }
    };
  }

  // VAPID 公钥 (从配置文件获取)
  private getVapidPublicKey(): string {
    return this.vapidConfig?.publicKey || 'BNcRdRSTGJOtTstkq6iu_BbYjSjuq26qjzO91qeBOGpeJVEj5l7u1baKVxRP0HeT5P8js5HXrWMTN1I3AIK1ZQ';
  }

  // 将 base64 字符串转换为 Uint8Array
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    try {
      const padding = '='.repeat((4 - base64String.length % 4) % 4);
      const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');

      const rawData = window.atob(base64);
      const outputArray = new Uint8Array(rawData.length);

      for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
      }
      return outputArray;
    } catch (error) {
      console.error('VAPID公钥解码失败:', error);
      // 返回一个空的Uint8Array作为fallback
      return new Uint8Array(0);
    }
  }

  // 将 ArrayBuffer 转换为 base64 字符串
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  // 发送测试推送消息到服务器 (模拟)
  async sendTestPushMessage(title: string, body: string): Promise<boolean> {
    try {
      const { subscription } = await this.getSubscriptionStatus();
      if (!subscription) {
        console.error('没有有效的推送订阅');
        return false;
      }

      // 检查通知权限
      if (Notification.permission !== 'granted') {
        console.error('通知权限未授予，当前权限:', Notification.permission);
        return false;
      }

      // 这里应该发送到实际的推送服务器
      // 现在我们只是模拟发送
      console.log('发送推送消息到服务器:', {
        subscription,
        message: { title, body }
      });

      // 模拟服务器响应
      setTimeout(() => {
        console.log('准备发送测试消息到Service Worker');
        console.log('Service Worker状态:', {
          registration: !!this.registration,
          active: !!this.registration?.active,
          permission: Notification.permission
        });
        
        // 通过Service Worker发送测试消息
        if (this.registration && this.registration.active) {
          console.log('Service Worker活跃，发送消息');
          this.registration.active.postMessage({
            type: 'TEST_PUSH_MESSAGE',
            title,
            body
          });
          
          // 同时尝试直接显示通知作为备用
          setTimeout(() => {
            console.log('尝试直接显示通知作为备用');
            this.registration?.showNotification(title, {
              body,
              icon: '/pwa-192x192.png',
              badge: '/pwa-192x192.png',
              tag: 'test-message-direct',
              data: {
                url: '/',
                timestamp: Date.now()
              },
              requireInteraction: false,
              silent: false
            });
          }, 2000);
        } else {
          console.log('Service Worker不可用，直接显示通知');
          // 如果Service Worker不可用，直接显示通知
          if (this.registration) {
            this.registration.showNotification(title, {
              body,
              icon: '/pwa-192x192.png',
              badge: '/pwa-192x192.png',
              tag: 'test-message',
              data: {
                url: '/',
                timestamp: Date.now()
              },
              requireInteraction: false,
              silent: false
            });
          }
        }
      }, 1000);

      return true;
    } catch (error) {
      console.error('发送推送消息失败:', error);
      return false;
    }
  }
}

export const pushSubscriptionService = new PushSubscriptionService(); 