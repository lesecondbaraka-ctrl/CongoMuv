import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Optimized Vite configuration for faster startup.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      // Alias pour les imports absolus
      { find: '@', replacement: path.resolve(__dirname, './src') },
      { find: '@components', replacement: path.resolve(__dirname, './src/components') },
      { find: '@lib', replacement: path.resolve(__dirname, './src/lib') },
      { find: '@pages', replacement: path.resolve(__dirname, './src/pages') },
    ],
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
    include: ['react', 'react-dom'], // Removed '@supabase/supabase-js' if not critical
  },
  server: {
    watch: {
      usePolling: false, // Disabled polling for better performance
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3002',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  cacheDir: './node_modules/.vite', // Added cache directory for faster rebuilds
  json: {
    stringify: true,
  },
  logLevel: 'info', // Added log level for better diagnostics
});
