import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
      proxy: {
        // 匹配所有以 /api 开头的请求
        '/api': {
          target: 'http://your-backend-api.com', // 后端真实接口地址
          changeOrigin: true,                   // 允许跨域
          rewrite: (path) => path.replace(/^\/api/, '') // 发送请求时移除 /api 前缀
        }
      }
    },
    plugins: [react()],
    build: {
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html'),
        },
      },
    },
    // define: {
    //   'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    //   'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    // },
    resolve: {
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json'],
      alias: {
        '@components': path.resolve(__dirname, 'src/components'),
        "@pages": path.resolve(__dirname, 'src/pages'),
        '@router': path.resolve(__dirname, 'src/router'),
        '@layouts': path.resolve(__dirname, 'src/layouts'),
        '@context': path.resolve(__dirname, 'src/context'),
        '@services': path.resolve(__dirname, 'services'),
      }
    }
  };
});
