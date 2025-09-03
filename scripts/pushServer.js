const webpush = require('web-push');
const fs = require('fs');
const path = require('path');

// 加载VAPID配置
const vapidConfigPath = path.join(__dirname, '../src/config/vapid.json');
const vapidConfig = JSON.parse(fs.readFileSync(vapidConfigPath, 'utf8'));

// 设置VAPID详情
webpush.setVapidDetails(
  vapidConfig.subject,
  vapidConfig.publicKey,
  vapidConfig.privateKey
);

// 推送消息函数
async function sendPushMessage(subscription, payload) {
  try {
    const result = await webpush.sendNotification(subscription, JSON.stringify(payload));
    console.log('推送消息发送成功:', result.statusCode);
    return true;
  } catch (error) {
    console.error('推送消息发送失败:', error);
    return false;
  }
}

// 示例：发送推送消息
const exampleSubscription = {
  endpoint: 'https://fcm.googleapis.com/fcm/send/...', // 实际的订阅端点
  keys: {
    p256dh: '...', // 实际的p256dh密钥
    auth: '...'    // 实际的auth密钥
  }
};

const payload = {
  title: '测试推送消息',
  body: '这是一条来自服务器的推送消息',
  icon: '/pwa-192x192.png',
  badge: '/pwa-192x192.png',
  tag: 'test-message',
  data: {
    url: '/',
    timestamp: Date.now()
  }
};

// 发送推送消息
sendPushMessage(exampleSubscription, payload);

module.exports = {
  sendPushMessage,
  webpush
}; 