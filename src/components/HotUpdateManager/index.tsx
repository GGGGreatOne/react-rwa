import { useState, useEffect } from 'react';
import { Button, Snackbar, Alert, Box, Typography, CircularProgress } from '@mui/material';
import { Refresh, Close, CheckCircle } from '@mui/icons-material';
import { useHotUpdate } from '@/hooks/useHotUpdate';

interface HotUpdateManagerProps {
  autoCheck?: boolean;
  checkInterval?: number; // 检查间隔（毫秒）
  showVersion?: boolean;
}

const HotUpdateManager: React.FC<HotUpdateManagerProps> = ({
  autoCheck = true,
  checkInterval = 5 * 60 * 1000, // 默认5分钟检查一次
  showVersion = false
}) => {
  const { updateInfo, checkForUpdates, applyUpdate, isChecking } = useHotUpdate();
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // 自动检查更新
  useEffect(() => {
    if (!autoCheck) return;

    const interval = setInterval(() => {
      checkForUpdates();
    }, checkInterval);

    return () => clearInterval(interval);
  }, [autoCheck, checkInterval, checkForUpdates]);

  // 监听更新状态变化
  useEffect(() => {
    if (updateInfo.hasUpdate) {
      setShowUpdatePrompt(true);
    }
  }, [updateInfo.hasUpdate]);

  const handleUpdate = async () => {
    await applyUpdate();
    setShowUpdatePrompt(false);
    setShowSuccess(true);

    // 3秒后隐藏成功提示
    setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
  };

  const handleClose = () => {
    setShowUpdatePrompt(false);
  };

  const handleManualCheck = async () => {
    await checkForUpdates();
  };

  return (
    <>
      {/* 更新提示 */}
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
            {showVersion && updateInfo.version && (
              <Box component="span" sx={{ ml: 1, opacity: 0.7 }}>
                (v{updateInfo.version})
              </Box>
            )}
          </Typography>
        </Alert>
      </Snackbar>

      {/* 成功提示 */}
      <Snackbar
        open={showSuccess}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{ bottom: { xs: 16, sm: 24 } }}
      >
        <Alert
          severity="success"
          icon={<CheckCircle />}
          sx={{ width: '100%' }}
        >
          <Typography variant="body2">
            更新已应用，页面即将刷新...
          </Typography>
        </Alert>
      </Snackbar>

      {/* 手动检查更新按钮（可选） */}
      {process.env.NODE_ENV === 'development' && (
        <Box sx={{ 
          position: 'fixed', 
          top: 80, 
          right: 16, 
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          gap: 1
        }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={isChecking ? <CircularProgress size={16} /> : <Refresh />}
            onClick={handleManualCheck}
            disabled={isChecking}
            sx={{
              backgroundColor: 'background.paper',
              boxShadow: 2,
              '&:hover': {
                backgroundColor: 'action.hover'
              }
            }}
          >
            {isChecking ? '检查中...' : '检查更新'}
          </Button>
        </Box>
      )}
    </>
  );
};

export default HotUpdateManager;
