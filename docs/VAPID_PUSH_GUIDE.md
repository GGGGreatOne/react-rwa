# VAPID推送消息使用指南

## 概述

本指南介绍如何在PWA应用中使用VAPID (Voluntary Application Server Identification) 实现推送消息功能。

## 1. 安装依赖

```bash
npm install web-push
```

## 2. 配置VAPID

VAPID配置文件 `src/config/vapid.json` 包含：
- `publicKey`: 公钥（前端使用）
- `privateKey`: 私钥（服务器端使用，不要暴露）
- `subject`: 主题（通常是邮箱地址）

## 3. 前端集成

### 3.1 推送订阅服务

`src/services/pushSubscription.ts` 已经集成了VAPID支持：

```typescript
// 自动加载VAPID配置
private async loadVapidConfig() {
  try {
    const response = await fetch('/src/config/vapid.json');
    this.vapidConfig = await response.json();
  } catch (error) {
    // 使用默认配置
  }
}

// 使用VAPID公钥订阅
const subscription = await this.registration.pushManager.subscribe({
  userVisibleOnly: true,
  applicationServerKey: this.urlBase64ToUint8Array(this.vapidConfig!.publicKey)
});
```

### 3.2 推送消息管理器

`src/components/PushMessageManager/index.tsx` 提供了完整的UI界面：
- 开启/关闭推送通知
- 发送测试消息
- 查看消息历史

## 4. 服务器端实现

### 4.1 启动推送服务器

```bash
node scripts/pushServerExpress.js
```

服务器将在 `http://localhost:3001` 启动。

### 4.2 API端点

- `GET /api/vapid-public-key` - 获取VAPID公钥
- `POST /api/subscribe` - 保存推送订阅
- `POST /api/unsubscribe` - 取消订阅
- `POST /api/send-notification` - 发送推送消息
- `GET /api/subscriptions` - 获取订阅统计

### 4.3 发送推送消息示例

```javascript
const payload = {
  title: '新消息',
  body: '您有一条新消息',
  icon: '/pwa-192x192.png',
  badge: '/pwa-192x192.png',
  tag: 'test-message',
  data: {
    url: '/',
    timestamp: Date.now()
  }
};

const response = await fetch('/api/send-notification', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(payload)
});
```

## 5. Service Worker处理

`src/sw.js` 已经配置了推送消息处理：

```javascript
// 推送消息处理
self.addEventListener('push', (event) => {
  const options = {
    body: notificationData.body,
    icon: notificationData.icon,
    badge: notificationData.badge,
    tag: notificationData.tag,
    data: notificationData.data,
    actions: [
      { action: 'view', title: '查看' },
      { action: 'dismiss', title: '忽略' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(notificationData.title, options)
  );
});
```

## 6. 测试流程

1. 启动开发服务器：`npm run dev`
2. 启动推送服务器：`node scripts/pushServerExpress.js`
3. 在PWA中开启推送通知
4. 使用推送消息管理器发送测试消息
5. 检查浏览器通知和消息历史

## 7. 生产环境注意事项

1. **VAPID私钥安全**：确保私钥只在服务器端使用，不要暴露给前端
2. **HTTPS要求**：推送消息需要HTTPS环境
3. **订阅管理**：在生产环境中使用数据库存储订阅信息
4. **错误处理**：处理无效订阅的清理
5. **消息限制**：注意推送消息的大小和频率限制

## 8. 故障排除

### 常见问题

1. **"AbortError: Registration failed - missing applicationServerKey"**
   - 确保VAPID公钥已正确配置
   - 检查Service Worker是否已注册

2. **推送消息未显示**
   - 检查通知权限是否已授予
   - 确认Service Worker正在运行

3. **订阅失败**
   - 验证VAPID配置是否正确
   - 检查网络连接

### 调试技巧

1. 查看浏览器控制台日志
2. 检查Service Worker状态
3. 验证VAPID密钥格式
4. 测试推送服务器连接

## 9. 扩展功能

- 消息分类和过滤
- 用户偏好设置
- 消息模板
- 推送统计和分析
- 多语言支持 