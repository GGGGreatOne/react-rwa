import { useState, useEffect } from 'react';
import { Button, Snackbar, Alert, Box, Typography } from '@mui/material';
import { Download, Close, Share } from '@mui/icons-material';
import IOSInstallGuide from '@/components/IOSInstallGuide';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    // 检测iOS设备
    const detectIOS = () => {
      const userAgent = window.navigator.userAgent.toLowerCase();
      const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
      setIsIOS(isIOSDevice);
      return isIOSDevice;
    };

    // 检查是否已经安装
    const checkIfInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches || 
          (window.navigator as Navigator & { standalone?: boolean }).standalone === true) {
        setIsInstalled(true);
      }
    };

    // 检查是否满足安装条件
    const checkInstallability = () => {
      const isIOSDevice = detectIOS();
      
      if (isIOSDevice) {
        // iOS设备：检查是否在Safari中且未安装
        const isInSafari = /safari/.test(window.navigator.userAgent.toLowerCase()) && 
                          !/chrome/.test(window.navigator.userAgent.toLowerCase());
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
        
        if (isInSafari && !isStandalone) {
          setShowInstallPrompt(true);
        }
      } else {
        // 非iOS设备：等待beforeinstallprompt事件
        // 事件监听器会在下面添加
      }
    };

    // 监听安装提示事件（仅Android/Chrome）
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstallPrompt(true);
    };

    // 监听安装完成事件
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
    };

    checkIfInstalled();
    checkInstallability();
    
    // 只对非iOS设备添加beforeinstallprompt监听
    if (!detectIOS()) {
      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    }
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      // iOS：显示安装指南
      setShowIOSGuide(true);
    } else if (deferredPrompt) {
      // Android/Chrome：使用原生安装提示
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
    }
  };

  const handleClose = () => {
    setShowInstallPrompt(false);
  };

  const handleIOSGuideClose = () => {
    setShowIOSGuide(false);
    setShowInstallPrompt(false);
  };

  if (isInstalled || !showInstallPrompt) {
    return (
      <IOSInstallGuide 
        open={showIOSGuide} 
        onClose={handleIOSGuideClose} 
      />
    );
  }

  return (
    <>
      <Snackbar
        open={showInstallPrompt}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{ bottom: { xs: 16, sm: 24 } }}
      >
        <Alert
          severity="info"
          action={
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                color="inherit"
                size="small"
                startIcon={isIOS ? <Share /> : <Download />}
                onClick={handleInstallClick}
                variant="contained"
              >
                {isIOS ? '安装指南' : '安装应用'}
              </Button>
              <Button
                color="inherit"
                size="small"
                onClick={handleClose}
                sx={{ minWidth: 'auto' }}
              >
                <Close />
              </Button>
            </Box>
          }
          sx={{ width: '100%' }}
        >
          <Typography variant="body2">
            {isIOS 
              ? '将此应用添加到主屏幕，获得更好的体验！'
              : '将此应用安装到桌面，获得更好的体验！'
            }
          </Typography>
        </Alert>
      </Snackbar>
      
      <IOSInstallGuide 
        open={showIOSGuide} 
        onClose={handleIOSGuideClose} 
      />
    </>
  );
};

export default PWAInstallPrompt;
