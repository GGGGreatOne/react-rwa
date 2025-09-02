# PWA 热更新功能

本项目已集成完整的PWA热更新功能，支持自动检测和应用更新。

## 功能特性

- 🔄 **自动更新检测**: 定期检查应用更新
- ⚡ **即时更新**: 支持立即应用更新
- 📱 **用户友好**: 提供更新提示和进度反馈
- 🛠️ **开发工具**: 开发模式下提供手动检查按钮
- 📊 **版本管理**: 自动版本号管理和构建时间记录

## 组件说明

### HotUpdateManager
主要的热更新管理组件，提供以下功能：

```tsx
import HotUpdateManager from '@/components/HotUpdateManager';

<HotUpdateManager 
  autoCheck={true}           // 是否自动检查更新
  checkInterval={300000}     // 检查间隔（毫秒），默认5分钟
  showVersion={true}         // 是否显示版本号
/>
```

### useHotUpdate Hook
热更新逻辑的React Hook，提供以下功能：

```tsx
import { useHotUpdate } from '@/hooks/useHotUpdate';

const { 
  updateInfo,      // 更新信息
  checkForUpdates, // 检查更新函数
  applyUpdate,     // 应用更新函数
  isChecking       // 是否正在检查
} = useHotUpdate();
```

## 使用方法

### 1. 基本集成
在应用根组件中添加HotUpdateManager：

```tsx
import HotUpdateManager from '@/components/HotUpdateManager';

function App() {
  return (
    <div>
      {/* 其他组件 */}
      <HotUpdateManager />
    </div>
  );
}
```

### 2. 自定义配置
```tsx
<HotUpdateManager 
  autoCheck={true}
  checkInterval={10 * 60 * 1000} // 10分钟检查一次
  showVersion={true}
/>
```

### 3. 手动控制更新
```tsx
import { useHotUpdate } from '@/hooks/useHotUpdate';

function MyComponent() {
  const { checkForUpdates, applyUpdate, updateInfo } = useHotUpdate();

  const handleManualUpdate = async () => {
    await checkForUpdates();
    if (updateInfo.hasUpdate) {
      await applyUpdate();
    }
  };

  return (
    <button onClick={handleManualUpdate}>
      手动检查更新
    </button>
  );
}
```

## 构建和部署

### 1. 开发模式
```bash
npm run dev
```
开发模式下会显示手动检查更新按钮。

### 2. 生产构建
```bash
# 普通构建
npm run build

# 带版本信息的构建
npm run build:version
```

### 3. 版本管理
版本信息会自动从package.json读取，并生成version.json文件：

```json
{
  "version": "3.0.0",
  "buildTime": "2024-01-01T00:00:00.000Z",
  "commitHash": "abc123"
}
```

## Service Worker 配置

Service Worker已配置为支持热更新：

- **立即激活**: 新版本立即接管页面
- **网络优先**: API请求优先使用网络
- **缓存更新**: 静态资源在后台更新缓存
- **版本管理**: 支持版本信息查询

## 更新流程

1. **检测更新**: 定期检查Service Worker更新
2. **下载更新**: 自动下载新版本资源
3. **提示用户**: 显示更新可用提示
4. **应用更新**: 用户确认后立即应用
5. **页面刷新**: 自动刷新页面以应用更新

## 注意事项

- 热更新功能需要HTTPS环境（生产环境）
- 开发环境支持HTTP，但功能可能受限
- 更新检测间隔建议不少于5分钟
- 确保Service Worker正确注册和激活

## 故障排除

### 更新不生效
1. 检查Service Worker是否正确注册
2. 确认网络连接正常
3. 检查浏览器缓存设置

### 版本信息不显示
1. 确认version.json文件存在
2. 检查构建脚本是否正确执行
3. 验证版本号格式

### 开发模式问题
1. 确保开发服务器正常运行
2. 检查浏览器控制台错误信息
3. 确认热更新配置正确
