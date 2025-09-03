// 模拟后端服务
export interface PushMessage {
  id: string;
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, unknown>;
  timestamp: number;
}

class MockBackendService {
  private messageQueue: PushMessage[] = [];
  private subscribers: ((message: PushMessage) => void)[] = [];
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = import.meta.env.DEV;
    
    // 只在开发环境中启动模拟推送服务
    if (this.isDevelopment) {
      this.startMockPushService();
    }
  }

  // 订阅推送消息
  subscribe(callback: (message: PushMessage) => void) {
    // 在生产环境中不提供订阅功能
    if (!this.isDevelopment) {
      return () => {}; // 返回空函数
    }
    
    this.subscribers.push(callback);
    return () => {
      const index = this.subscribers.indexOf(callback);
      if (index > -1) {
        this.subscribers.splice(index, 1);
      }
    };
  }

  // 发送推送消息
  private sendPushMessage(message: PushMessage) {
    this.messageQueue.push(message);
    this.subscribers.forEach(callback => callback(message));
  }

  // 模拟推送服务
  private startMockPushService() {
    const mockMessages = [
      {
        title: "系统更新",
        body: "您的应用已更新到最新版本",
        icon: "/pwa-192x192.png",
        tag: "system-update"
      },
      {
        title: "新功能上线",
        body: "热更新功能现已可用！",
        icon: "/pwa-192x192.png",
        tag: "feature-update"
      },
      {
        title: "性能优化",
        body: "应用性能已优化，体验更流畅",
        icon: "/pwa-192x192.png",
        tag: "performance"
      },
      {
        title: "安全提醒",
        body: "请及时更新您的密码",
        icon: "/pwa-192x192.png",
        tag: "security"
      },
      {
        title: "用户反馈",
        body: "感谢您的反馈，我们已收到",
        icon: "/pwa-192x192.png",
        tag: "feedback"
      }
    ];

    let messageIndex = 0;
    
    // 每30秒发送一条消息
    setInterval(() => {
      const mockMessage = mockMessages[messageIndex % mockMessages.length];
      const message: PushMessage = {
        id: `msg_${Date.now()}`,
        title: mockMessage.title,
        body: mockMessage.body,
        icon: mockMessage.icon,
        tag: mockMessage.tag,
        timestamp: Date.now(),
        data: {
          url: '/',
          action: 'view'
        }
      };
      
      this.sendPushMessage(message);
      messageIndex++;
    }, 30000); // 30秒间隔

    // 立即发送一条欢迎消息
    setTimeout(() => {
      const welcomeMessage: PushMessage = {
        id: `welcome_${Date.now()}`,
        title: "欢迎使用PWA",
        body: "您的PWA应用已准备就绪",
        icon: "/pwa-192x192.png",
        tag: "welcome",
        timestamp: Date.now(),
        data: {
          url: '/',
          action: 'view'
        }
      };
      this.sendPushMessage(welcomeMessage);
    }, 2000);
  }

  // 手动发送测试消息
  sendTestMessage(title: string, body: string) {
    // 在生产环境中不发送测试消息
    if (!this.isDevelopment) {
      return;
    }
    
    const message: PushMessage = {
      id: `test_${Date.now()}`,
      title,
      body,
      icon: "/pwa-192x192.png",
      tag: "test",
      timestamp: Date.now(),
      data: {
        url: '/',
        action: 'view'
      }
    };
    this.sendPushMessage(message);
  }

  // 获取历史消息
  getHistoryMessages(): PushMessage[] {
    // 在生产环境中返回空数组
    if (!this.isDevelopment) {
      return [];
    }
    return [...this.messageQueue];
  }
}

export const mockBackendService = new MockBackendService(); 