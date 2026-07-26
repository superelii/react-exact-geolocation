// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  root: path.resolve(__dirname, 'test'), // 指定测试目录为根目录
  server: {
    port: 3000,
    open: true, // 自动打开浏览器
  },
   build: {
    lib: {
      entry: './src/index.ts',
      formats: ['es']
    },
    rollupOptions: {
      external: ['react', 'react-dom']
    }
  }
});