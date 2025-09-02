import { useState, useEffect, useCallback } from 'react';
import versionInfo from '@/version.json';

interface UpdateInfo {
  version: string;
  timestamp: number;
  hasUpdate: boolean;
  currentVersion: string;
}

interface UseHotUpdateReturn {
  updateInfo: UpdateInfo;
  checkForUpdates: () => Promise<void>;
  applyUpdate: () => Promise<void>;
  isChecking: boolean;
}

export const useHotUpdate = (): UseHotUpdateReturn => {
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo>({
    version: '',
    timestamp: 0,
    hasUpdate: false,
    currentVersion: versionInfo.version
  });
  const [isChecking, setIsChecking] = useState(false);

  // 检查更新
  const checkForUpdates = useCallback(async () => {
    if (!('serviceWorker' in navigator)) {
      return;
    }

    setIsChecking(true);
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        // 手动触发更新检查
        console.log('手动触发更新检查')
        await registration.update();

        // 获取版本信息
        const versionInfo = await new Promise<{ version: string; timestamp: number }>((resolve) => {
          const channel = new MessageChannel();
          channel.port1.onmessage = (event) => {
            if (event.data.type === 'VERSION_INFO') {
              resolve({
                version: event.data.version,
                timestamp: event.data.timestamp
              });
            }
          };

          registration.active?.postMessage(
            { type: 'GET_VERSION' },
            [channel.port2]
          );
        });
        console.log('版本信息:', versionInfo);
        setUpdateInfo({
          ...versionInfo,
          hasUpdate: false, // 这里可以根据实际逻辑判断是否有更新
          currentVersion: versionInfo.version
        });
      }
    } catch (error) {
      console.error('检查更新失败:', error);
    } finally {
      setIsChecking(false);
    }
  }, []);

  // 应用更新
  const applyUpdate = useCallback(async () => {
    if (!('serviceWorker' in navigator)) {
      return;
    }

    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration && registration.waiting) {
        // 发送跳过等待消息
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });

        // 监听控制器变化
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          window.location.reload();
        });
      }
    } catch (error) {
      console.error('应用更新失败:', error);
    }
  }, []);

  // 初始化时检查更新
  useEffect(() => {
    checkForUpdates();
  }, [checkForUpdates]);

  // 监听Service Worker更新
  useEffect(() => {
    if (!('serviceWorker' in navigator)) {
      return;
    }

    const handleUpdateFound = () => {
      navigator.serviceWorker.getRegistration().then((registration) => {
        if (registration) {
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('controller', navigator.serviceWorker.controller)
                  setUpdateInfo(prev => ({ ...prev, hasUpdate: true }));
                }
              });
            }
          });
        }
      });
    };

    handleUpdateFound();
  }, []);

  return {
    updateInfo,
    checkForUpdates,
    applyUpdate,
    isChecking
  };
};
