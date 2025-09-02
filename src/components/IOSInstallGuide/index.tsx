import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  Typography, 
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { 
  Share, 
  Add, 
  CheckCircle,
  Close
} from '@mui/icons-material';

interface IOSInstallGuideProps {
  open: boolean;
  onClose: () => void;
}

const IOSInstallGuide: React.FC<IOSInstallGuideProps> = ({ open, onClose }) => {
  const steps = [
    {
      icon: <Share />,
      text: '点击底部的"分享"按钮'
    },
    {
      icon: <Add />,
      text: '选择"添加到主屏幕"选项'
    },
    {
      icon: <CheckCircle />,
      text: '点击"添加"完成安装'
    }
  ];

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">
            安装到主屏幕
          </Typography>
          <Button onClick={onClose} size="small">
            <Close />
          </Button>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body1" gutterBottom>
          请按照以下步骤将应用添加到主屏幕：
        </Typography>
        <List>
          {steps.map((step, index) => (
            <ListItem key={index}>
              <ListItemIcon>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  bgcolor: 'primary.main',
                  color: 'white'
                }}>
                  {step.icon}
                </Box>
              </ListItemIcon>
              <ListItemText 
                primary={`${index + 1}. ${step.text}`}
                primaryTypographyProps={{ variant: 'body1' }}
              />
            </ListItem>
          ))}
        </List>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          安装后，您可以从主屏幕直接启动应用，获得更好的体验！
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained">
          知道了
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default IOSInstallGuide;
