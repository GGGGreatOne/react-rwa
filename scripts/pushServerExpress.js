const express = require('express');
const webpush = require('web-push');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;

// 中间件
app.use(express.json());
app.use(express.static('dist')); // 服务PWA静态文件

// 加载VAPID配置
const vapidConfigPath = path.join(__dirname, '../src/config/vapid.json');
const vapidConfig = JSON.parse(fs.readFileSync(vapidConfigPath, 'utf8'));

// 设置VAPID详情
webpush.setVapidDetails(
  vapidConfig.subject,
  vapidConfig.publicKey,
  vapidConfig.privateKey
);

// 存储订阅信息（在实际应用中应该使用数据库）
const subscriptions = [];

// 获取VAPID公钥
app.get('/api/vapid-public-key', (req, res) => {
  res.json({ publicKey: vapidConfig.publicKey });
});

// 保存推送订阅
app.post('/api/subscribe', (req, res) => {
  const subscription = req.body;
  
  // 检查是否已存在
  const existingIndex = subscriptions.findIndex(sub => 
    sub.endpoint === subscription.endpoint
  );
  
  if (existingIndex >= 0) {
    subscriptions[existingIndex] = subscription;
  } else {
    subscriptions.push(subscription);
  }
  
  console.log('订阅已保存，当前订阅数:', subscriptions.length);
  res.json({ success: true, message: '订阅已保存' });
});

// 取消订阅
app.post('/api/unsubscribe', (req, res) => {
  const { endpoint } = req.body;
  const index = subscriptions.findIndex(sub => sub.endpoint === endpoint);
  
  if (index >= 0) {
    subscriptions.splice(index, 1);
    console.log('订阅已取消，当前订阅数:', subscriptions.length);
    res.json({ success: true, message: '订阅已取消' });
  } else {
    res.status(404).json({ success: false, message: '未找到订阅' });
  }
});

// 发送推送消息
app.post('/api/send-notification', async (req, res) => {
  const { title, body, icon, tag, data } = req.body;
  
  if (!subscriptions.length) {
    return res.status(400).json({ 
      success: false, 
      message: '没有活跃的订阅' 
    });
  }
  
  const payload = {
    title: title || '新消息',
    body: body || '您有一条新消息',
    icon: icon || '/pwa-192x192.png',
    badge: '/pwa-192x192.png',
    tag: tag || 'default',
    data: data || {
      url: '/',
      timestamp: Date.now()
    }
  };
  
  const results = [];
  
  // 向所有订阅者发送消息
  for (const subscription of subscriptions) {
    try {
      const result = await webpush.sendNotification(
        subscription, 
        JSON.stringify(payload)
      );
      results.push({ 
        endpoint: subscription.endpoint, 
        success: true, 
        statusCode: result.statusCode 
      });
    } catch (error) {
      console.error('发送失败:', error);
      results.push({ 
        endpoint: subscription.endpoint, 
        success: false, 
        error: error.message 
      });
      
      // 如果订阅无效，从列表中移除
      if (error.statusCode === 410) {
        const index = subscriptions.findIndex(sub => 
          sub.endpoint === subscription.endpoint
        );
        if (index >= 0) {
          subscriptions.splice(index, 1);
        }
      }
    }
  }
  
  res.json({
    success: true,
    message: `消息已发送给 ${subscriptions.length} 个订阅者`,
    results
  });
});

// 获取订阅统计
app.get('/api/subscriptions', (req, res) => {
  res.json({
    count: subscriptions.length,
    subscriptions: subscriptions.map(sub => ({
      endpoint: sub.endpoint,
      keys: {
        p256dh: sub.keys.p256dh ? '***' : null,
        auth: sub.keys.auth ? '***' : null
      }
    }))
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`推送服务器运行在 http://localhost:${PORT}`);
  console.log(`VAPID公钥: ${vapidConfig.publicKey}`);
  console.log(`当前订阅数: ${subscriptions.length}`);
});

module.exports = app; 