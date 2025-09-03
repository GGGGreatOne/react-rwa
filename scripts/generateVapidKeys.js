import webpush from 'web-push';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 生成VAPID密钥对
const vapidKeys = webpush.generateVAPIDKeys();

console.log('VAPID密钥对已生成:');
console.log('=====================================');
console.log('Public Key (公钥):');
console.log(vapidKeys.publicKey);
console.log('=====================================');
console.log('Private Key (私钥):');
console.log(vapidKeys.privateKey);
console.log('=====================================');
console.log('Subject (主题):');
console.log('mailto:your-email@example.com');
console.log('=====================================');

// 将公钥保存到配置文件
const configPath = path.join(__dirname, '../src/config/vapid.json');
const configDir = path.dirname(configPath);

if (!fs.existsSync(configDir)) {
  fs.mkdirSync(configDir, { recursive: true });
}

const config = {
  publicKey: vapidKeys.publicKey,
  privateKey: vapidKeys.privateKey,
  subject: 'mailto:your-email@example.com'
};

fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
console.log(`配置已保存到: ${configPath}`);
console.log('请将私钥保存在服务器端，不要暴露在前端代码中！'); 