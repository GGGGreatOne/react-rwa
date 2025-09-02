import { Fragment } from 'react';
import { BrowserRouter } from 'react-router';

import { CssBaseline } from '@mui/material';

import { withErrorHandler } from '@/error-handling';
import AppErrorBoundaryFallback from '@/error-handling/fallbacks/App';

import Pages from './routes/Pages';
import Header from './sections/Header';
import HotKeys from './sections/HotKeys';
import Sidebar from './sections/Sidebar';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import HotUpdateManager from './components/HotUpdateManager';

function App() {
  return (
    <Fragment>
      <BrowserRouter>
        <CssBaseline />
        <HotKeys />
        <Header />
        <Sidebar />
        <Pages />
        <PWAInstallPrompt />
        <HotUpdateManager
          autoCheck={false}
          checkInterval={5 * 60 * 1000} // 5分钟检查一次
          showVersion={true}
        />
      </BrowserRouter>
    </Fragment>
  );
}

const AppWithErrorHandler = withErrorHandler(App, AppErrorBoundaryFallback);
export default AppWithErrorHandler;
