import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// 仅用于本地演示（dev），不影响库的构建产物
export default defineConfig({
  plugins: [react()],
  root: path.resolve(__dirname, 'demo'),
  server: {
    // host: true 暴露到局域网，手机可通过 PC 的局域网 IP 访问
    host: true,
    port: 5173,
    open: true,
  },
});
