import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import svgr from 'vite-plugin-svgr';

// https://vite.dev/config/
export default defineConfig({
  server: {
    port: 8888,
    host: true,
    hmr: {
      overlay: true,
    },
  },
  plugins: [
    react(),
    svgr(),
    VitePWA({
      manifest: {
        name: "React+PWA",
        short_name: "reactpwa",
        description: "Starter kit for modern web applications",
        start_url: "/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#ffffff",
        orientation: "portrait-primary",
        scope: "/",
        lang: "en",
        categories: ["productivity", "utilities"],
        shortcuts: [
          {
            name: "Home",
            short_name: "Home",
            description: "Go to home page",
            url: "/",
            icons: [{ src: "pwa-192x192.png", sizes: "192x192" }]
          }
        ],
        icons: [
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png"
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable"
          }
        ]
      },
      includeAssets: ['favicon.svg', 'favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
      // 开发时启用service worker以测试PWA功能
      devOptions: { 
        enabled: true,
        type: 'module'
      },
      registerType: 'autoUpdate',
      workbox: { 
        globPatterns: ['**/*.{js,css,html}', '**/*.{svg,png,jpg,gif}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              }
            }
          }
        ]
      },
      injectRegister: 'auto',
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.js',
      // 热更新配置
      injectManifest: {
        injectionPoint: undefined,
      }
    }),
  ],
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
  // 构建配置
  build: {
    // 生成source map以支持热更新调试
    sourcemap: true,
    // 优化配置
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          mui: ['@mui/material', '@mui/icons-material'],
        }
      }
    }
  }
});
