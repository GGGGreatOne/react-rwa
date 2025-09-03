import { FullSizeCentered } from '@/components/styled';
import useOrientation from '@/hooks/useOrientation';
import { Box } from '@mui/material';

// 使用vite-plugin-svgr导入SVG组件
import PwaLogo from './logos/pwa.svg?react';
import ReactLogo from './logos/react_ed.svg?react';
import RecoilLogo from './logos/recoil.svg?react';
import RrLogo from './logos/rr.svg?react';
import TsLogo from './logos/ts.svg?react';
import ViteLogo from './logos/vite.svg?react';
import MuiLogo from './logos/mui.svg?react';
import {Button} from "@mui/material";
import {useCallback} from "react";

function Welcome() {
  const isPortrait = useOrientation();
  const subNotify = useCallback(() => {
    Notification.requestPermission().then(permission => {
      if (permission === "granted") {
        console.log("The user accepted to receive notifications");
      }
    });
  }, [])

  return (
    <>
      <meta name="title" content="Welcome" />
      <FullSizeCentered flexDirection={isPortrait ? 'column' : 'row'}>
        <Button onClick={subNotify}>订阅消息通知</Button>

        {/* Logo展示区域 - 按照图片顺序排列 */}
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          flexWrap: 'wrap',
          maxWidth: '80%'
        }}>
          {/* 1. 红色抽象形状 (Recoil) */}
          <Box sx={{ width: '60px', height: '60px' }}>
            <RecoilLogo width="100%" height="100%" />
          </Box>

          {/* 2. 紫色倒三角 (Vite) */}
          <Box sx={{ width: '60px', height: '60px' }}>
            <ViteLogo width="100%" height="100%" />
          </Box>

          {/* 3. 蓝色圆圈TS (TypeScript) */}
          <Box sx={{ width: '60px', height: '60px' }}>
            <TsLogo width="100%" height="100%" />
          </Box>

          {/* 4. 中央大React logo */}
          <Box sx={{ width: '120px', height: '120px' }}>
            <ReactLogo width="100%" height="100%" />
          </Box>

          {/* 5. 蓝色M形状 (MUI) */}
          <Box sx={{ width: '60px', height: '60px' }}>
            <MuiLogo width="100%" height="100%" />
          </Box>

          {/* 6. 蓝色波浪线 (React Router) */}
          <Box sx={{ width: '60px', height: '60px' }}>
            <RrLogo width="100%" height="100%" />
          </Box>

          {/* 7. PWA文字 */}
          <Box sx={{ width: '60px', height: '60px' }}>
            <PwaLogo width="100%" height="100%" />
          </Box>
        </Box>
      </FullSizeCentered>
    </>
  );
}

export default Welcome;
