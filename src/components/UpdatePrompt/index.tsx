import { useState, useEffect } from 'react';
import { Button, Snackbar, Alert, Box, Typography } from '@mui/material';
import { Refresh, Close } from '@mui/icons-material';

interface UpdatePromptProps {
  onUpdate?: () => void;
}

const UpdatePrompt: React.FC<UpdatePromptProps> = ({ onUpdate }) => {
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    // 检查是否有可用的更新
    const checkForUpdates = async () => {
      if ('serviceWorker' in navigator) {
        try {
          const reg = await navigator.serviceWorker.getRegistration();
          if (reg) {
            setRegistration(reg);
            
            // 监听更新事件
            reg.addEventListener('updatefound', () => {
              const newWorker = reg.installing;
              if (newWorker) {
                newWorker.addEventListener('statechange', () => {
                  if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    setShowUpdatePrompt(true);
                  }
                });
              }
            });
          }
        } catch (error) {
          console.error('检查更新失败:', error);
        }
      }
    };

    checkForUpdates();
  }, []);

  const handleUpdate = async () => {
    if (registration && registration.waiting) {
      // 发送跳过等待消息给Service Worker
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      
      // 监听控制器变化
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        // 重新加载页面以应用更新
        window.location.reload();
      });
      
      onUpdate?.();
    }
  };

  const handleClose = () => {
    setShowUpdatePrompt(false);
  };

  if (!showUpdatePrompt) {
    return null;
  }

  return (
    <Snackbar
      open={showUpdatePrompt}
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
              startIcon={<Refresh />}
              onClick={handleUpdate}
              variant="contained"
            >
              立即更新
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
          发现新版本，点击更新获得最新功能！
        </Typography>
      </Alert>
    </Snackbar>
  );
};

export default UpdatePrompt;
