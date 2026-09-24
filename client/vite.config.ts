import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  const isExtension = mode === 'extension';

  return {
    plugins: [react()],
    base: isExtension ? './' : '/',
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true,
        },
        '/uploads': {
          target: 'http://localhost:3001',
          changeOrigin: true,
        }
      },
    },
    build: {
      outDir: isExtension ? 'dist-extension' : 'dist',
      emptyOutDir: true,
    },
  };
});
