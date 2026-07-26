import path from 'node:path';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  envDir: path.resolve(__dirname, '../../'),
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return;
          }

          if (id.includes('react-hook-form') || id.includes('@hookform') || id.includes('\\zod\\')) {
            return 'forms';
          }

          if (id.includes('socket.io-client') || id.includes('axios') || id.includes('date-fns')) {
            return 'realtime';
          }

          if (id.includes('framer-motion')) {
            return 'motion';
          }

          if (id.includes('lucide-react') || id.includes('sonner') || id.includes('clsx') || id.includes('tailwind-merge')) {
            return 'ui';
          }
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
