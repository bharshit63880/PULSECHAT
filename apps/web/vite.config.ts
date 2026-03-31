import path from 'node:path';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  envDir: path.resolve(__dirname, '../../'),
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          query: ['@tanstack/react-query', 'zustand'],
          forms: ['react-hook-form', '@hookform/resolvers', 'zod'],
          realtime: ['socket.io-client', 'axios', 'date-fns'],
          ui: ['lucide-react', 'sonner', 'clsx', 'tailwind-merge']
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@chat-app/shared': path.resolve(__dirname, '../../packages/shared/src/index.ts'),
      '@chat-app/shared/': path.resolve(__dirname, '../../packages/shared/src/')
    }
  },
  server: {
    port: 5173
  }
});
