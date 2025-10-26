import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
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
    include: [
      'react',
      'react-dom',
      '@supabase/supabase-js'
    ],
  },
  server: {
    // Forcer le rechargement des modules
    watch: {
      usePolling: true,
    },
  },
  // Pour le support des imports JSON
  json: {
    stringify: true
  }
});
