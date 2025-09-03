import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Switch,
  FormControlLabel,
  CircularProgress,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  IconButton
} from '@mui/material';
import {
  NotificationsActive,
  NotificationsOff,
  Send,
  History,
  Close,
  Info,
  Warning,
  CheckCircle
} from '@mui/icons-material';
import { pushSubscriptionService } from '@/services/pushSubscription';
import { mockBackendService, PushMessage } from '@/services/mockBackend';

// 检查是否为开发环境
const isDevelopment = import.meta.env.DEV;

const PushMessageManager: React.FC = () => {
  const [pushEnabled, setPushEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showTestDialog, setShowTestDialog] = useState(false);
  const [testTitle, setTestTitle] = useState('');
  const [testBody, setTestBody] = useState('');
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'info'
  });
  const [messages, setMessages] = useState<PushMessage[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    // 只在开发环境中执行
    if (!isDevelopment) {
      return;
    }

    checkSubscriptionStatus();

    // 订阅推送消息
    const unsubscribe = mockBackendService.subscribe((message) => {
      setMessages(prev => [message, ...prev]);

      // 显示系统通知
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(message.title, {
          body: message.body,
          icon: message.icon,
          tag: message.tag,
          data: message.data
        });
      }

      // 显示Snackbar
      setSnackbar({
        open: true,
        message: `${message.title}: ${message.body}`,
        severity: 'info'
      });
    });

    // 获取历史消息
    setMessages(mockBackendService.getHistoryMessages());

    // 监听Service Worker消息
    const handleServiceWorkerMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'NOTIFICATION_CLICKED') {
        console.log('通知被点击:', event.data);
        // 可以在这里添加处理逻辑，比如显示消息详情
        if (event.data.tag === 'test-message') {
          setSnackbar({
            open: true,
            message: '测试消息被点击',
            severity: 'info'
          });
        }
      }
    };

    navigator.serviceWorker?.addEventListener('message', handleServiceWorkerMessage);

    return () => {
      unsubscribe();
      navigator.serviceWorker?.removeEventListener('message', handleServiceWorkerMessage);
    };
  }, []);

  const checkSubscriptionStatus = async () => {
    try {
      const status = await pushSubscriptionService.getSubscriptionStatus();
      setPushEnabled(status.subscribed);
    } catch (error) {
      console.error('检查订阅状态失败:', error);
    }
  };

  const handlePushToggle = async () => {
    setLoading(true);
    try {
      if (pushEnabled) {
        const success = await pushSubscriptionService.unsubscribeFromPush();
        if (success) {
          setPushEnabled(false);
          setSnackbar({
            open: true,
            message: '推送通知已关闭',
            severity: 'info'
          });
        } else {
          setSnackbar({
            open: true,
            message: '取消订阅失败',
            severity: 'error'
          });
        }
      } else {
        const permissionGranted = await pushSubscriptionService.requestNotificationPermission();
        if (permissionGranted) {
          const subscription = await pushSubscriptionService.subscribeToPush();
          if (subscription) {
            setPushEnabled(true);
            setSnackbar({
              open: true,
              message: '推送通知已开启',
              severity: 'success'
            });
          } else {
            setSnackbar({
              open: true,
              message: '推送订阅失败',
              severity: 'error'
            });
          }
        } else {
          setSnackbar({
            open: true,
            message: '需要通知权限才能开启推送',
            severity: 'warning'
          });
        }
      }
    } catch (error) {
      console.error('推送操作失败:', error);
      setSnackbar({
        open: true,
        message: '推送操作失败',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendTestMessage = async () => {
    if (testTitle.trim() && testBody.trim()) {
      setLoading(true);
      try {
        const success = await pushSubscriptionService.sendTestPushMessage(testTitle, testBody);
        if (success) {
          setTestTitle('');
          setTestBody('');
          setShowTestDialog(false);
          setSnackbar({
            open: true,
            message: '测试消息已发送',
            severity: 'success'
          });
        } else {
          setSnackbar({
            open: true,
            message: '发送测试消息失败',
            severity: 'error'
          });
        }
      } catch (error) {
        console.error('发送测试消息失败:', error);
        setSnackbar({
          open: true,
          message: '发送测试消息失败',
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const getMessageIcon = (tag?: string) => {
    switch (tag) {
      case 'system-update':
        return <Info color="primary" />;
      case 'feature-update':
        return <CheckCircle color="success" />;
      case 'performance':
        return <CheckCircle color="success" />;
      case 'security':
        return <Warning color="warning" />;
      case 'feedback':
        return <Info color="info" />;
      default:
        return <Info color="primary" />;
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

    return (
    <>
      {/* 只在开发环境中显示 */}
      {!isDevelopment ? null : (
        <>
          <Box sx={{
            position: 'sticky',
            top: 0,
            left: 0,
            zIndex: 1000,
            p: 2,
            backgroundColor: 'background.paper',
            borderBottom: 1,
            borderColor: 'divider'
          }}>
            <Card sx={{ minWidth: 200, alignSelf: 'flex-start' }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  推送消息管理
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={pushEnabled}
                        onChange={handlePushToggle}
                        color="primary"
                        disabled={loading}
                      />
                    }
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {loading ? (
                          <CircularProgress size={16} />
                        ) : pushEnabled ? (
                          <NotificationsActive color="primary" />
                        ) : (
                          <NotificationsOff />
                        )}
                        <Typography variant="body2">
                          {loading ? '处理中...' : pushEnabled ? '推送已开启' : '推送已关闭'}
                        </Typography>
                      </Box>
                    }
                  />

                  <Button
                    variant="outlined"
                    startIcon={loading ? <CircularProgress size={16} /> : <Send />}
                    onClick={() => setShowTestDialog(true)}
                    size="small"
                    disabled={!pushEnabled || loading}
                  >
                    {loading ? '发送中...' : '发送测试消息'}
                  </Button>

                  <Button
                    variant="outlined"
                    startIcon={<History />}
                    onClick={() => setShowHistory(true)}
                    size="small"
                  >
                    查看历史 ({messages.length})
                  </Button>

                  <Button
                    variant="outlined"
                    startIcon={<Info />}
                    onClick={() => {
                      if (Notification.permission === 'granted') {
                        new Notification('测试通知', {
                          body: '这是一个直接测试通知',
                          icon: '/pwa-192x192.png'
                        });
                      } else {
                        setSnackbar({
                          open: true,
                          message: '通知权限未授予',
                          severity: 'warning'
                        });
                      }
                    }}
                    size="small"
                  >
                    测试通知权限
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Box>

          {/* 测试消息对话框 */}
          <Dialog open={showTestDialog} onClose={() => setShowTestDialog(false)}>
            <DialogTitle>发送测试推送消息</DialogTitle>
            <DialogContent>
              <TextField
                autoFocus
                margin="dense"
                label="消息标题"
                fullWidth
                variant="outlined"
                value={testTitle}
                onChange={(e) => setTestTitle(e.target.value)}
                sx={{ mb: 2 }}
              />
              <TextField
                margin="dense"
                label="消息内容"
                fullWidth
                multiline
                rows={3}
                variant="outlined"
                value={testBody}
                onChange={(e) => setTestBody(e.target.value)}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setShowTestDialog(false)} disabled={loading}>取消</Button>
              <Button
                onClick={handleSendTestMessage}
                variant="contained"
                disabled={loading || !testTitle.trim() || !testBody.trim()}
                startIcon={loading ? <CircularProgress size={16} /> : undefined}
              >
                {loading ? '发送中...' : '发送'}
              </Button>
            </DialogActions>
          </Dialog>

          {/* 历史消息对话框 */}
          <Dialog
            open={showHistory}
            onClose={() => setShowHistory(false)}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle>
              推送消息历史
              <IconButton
                aria-label="close"
                onClick={() => setShowHistory(false)}
                sx={{ position: 'absolute', right: 8, top: 8 }}
              >
                <Close />
              </IconButton>
            </DialogTitle>
            <DialogContent>
              {messages.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                  暂无推送消息
                </Typography>
              ) : (
                <List>
                  {messages.map((message) => (
                    <ListItem key={message.id} divider>
                      <ListItemIcon>
                        {getMessageIcon(message.tag)}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography variant="subtitle1" component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {message.title}
                            <Chip
                              label={message.tag}
                              size="small"
                              variant="outlined"
                            />
                          </Typography>
                        }
                        secondary={
                          <Typography variant="body2" color="text.secondary" component="span" sx={{ display: 'block' }}>
                            {message.body}
                            <Typography variant="caption" color="text.secondary" component="span" sx={{ display: 'block', mt: 0.5 }}>
                              {formatTime(message.timestamp)}
                            </Typography>
                          </Typography>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </DialogContent>
          </Dialog>

          {/* Snackbar通知 */}
          <Snackbar
            open={snackbar.open}
            autoHideDuration={4000}
            onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          >
            <Alert
              onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
              severity={snackbar.severity}
              sx={{ width: '100%' }}
            >
              {snackbar.message}
            </Alert>
          </Snackbar>
        </>
      )}
    </>
  );
};

export default PushMessageManager;
