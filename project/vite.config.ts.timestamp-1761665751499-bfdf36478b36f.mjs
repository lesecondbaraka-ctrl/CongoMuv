// vite.config.ts
import { defineConfig } from "file:///C:/Users/LEGRAND/Downloads/CongoMuv/project/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/LEGRAND/Downloads/CongoMuv/project/node_modules/@vitejs/plugin-react/dist/index.mjs";
import path from "path";
var __vite_injected_original_dirname = "C:\\Users\\LEGRAND\\Downloads\\CongoMuv\\project";
var vite_config_default = defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      // Alias pour les imports absolus
      { find: "@", replacement: path.resolve(__vite_injected_original_dirname, "./src") },
      { find: "@components", replacement: path.resolve(__vite_injected_original_dirname, "./src/components") },
      { find: "@lib", replacement: path.resolve(__vite_injected_original_dirname, "./src/lib") },
      { find: "@pages", replacement: path.resolve(__vite_injected_original_dirname, "./src/pages") }
    ]
  },
  optimizeDeps: {
    exclude: ["lucide-react"],
    include: [
      "react",
      "react-dom",
      "@supabase/supabase-js"
    ]
  },
  server: {
    // Forcer le rechargement des modules
    watch: {
      usePolling: true
    },
    proxy: {
      "/api": {
        target: "http://localhost:3002",
        changeOrigin: true,
        secure: false
      }
    }
  },
  // Pour le support des imports JSON
  json: {
    stringify: true
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxMRUdSQU5EXFxcXERvd25sb2Fkc1xcXFxDb25nb011dlxcXFxwcm9qZWN0XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxMRUdSQU5EXFxcXERvd25sb2Fkc1xcXFxDb25nb011dlxcXFxwcm9qZWN0XFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9MRUdSQU5EL0Rvd25sb2Fkcy9Db25nb011di9wcm9qZWN0L3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSc7XG5pbXBvcnQgcmVhY3QgZnJvbSAnQHZpdGVqcy9wbHVnaW4tcmVhY3QnO1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5cbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBwbHVnaW5zOiBbcmVhY3QoKV0sXG4gIHJlc29sdmU6IHtcbiAgICBhbGlhczogW1xuICAgICAgLy8gQWxpYXMgcG91ciBsZXMgaW1wb3J0cyBhYnNvbHVzXG4gICAgICB7IGZpbmQ6ICdAJywgcmVwbGFjZW1lbnQ6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuL3NyYycpIH0sXG4gICAgICB7IGZpbmQ6ICdAY29tcG9uZW50cycsIHJlcGxhY2VtZW50OiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi9zcmMvY29tcG9uZW50cycpIH0sXG4gICAgICB7IGZpbmQ6ICdAbGliJywgcmVwbGFjZW1lbnQ6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuL3NyYy9saWInKSB9LFxuICAgICAgeyBmaW5kOiAnQHBhZ2VzJywgcmVwbGFjZW1lbnQ6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuL3NyYy9wYWdlcycpIH0sXG4gICAgXSxcbiAgfSxcbiAgb3B0aW1pemVEZXBzOiB7XG4gICAgZXhjbHVkZTogWydsdWNpZGUtcmVhY3QnXSxcbiAgICBpbmNsdWRlOiBbXG4gICAgICAncmVhY3QnLFxuICAgICAgJ3JlYWN0LWRvbScsXG4gICAgICAnQHN1cGFiYXNlL3N1cGFiYXNlLWpzJ1xuICAgIF0sXG4gIH0sXG4gIHNlcnZlcjoge1xuICAgIC8vIEZvcmNlciBsZSByZWNoYXJnZW1lbnQgZGVzIG1vZHVsZXNcbiAgICB3YXRjaDoge1xuICAgICAgdXNlUG9sbGluZzogdHJ1ZSxcbiAgICB9LFxuICAgIHByb3h5OiB7XG4gICAgICAnL2FwaSc6IHtcbiAgICAgICAgdGFyZ2V0OiAnaHR0cDovL2xvY2FsaG9zdDozMDAyJyxcbiAgICAgICAgY2hhbmdlT3JpZ2luOiB0cnVlLFxuICAgICAgICBzZWN1cmU6IGZhbHNlLFxuICAgICAgfSxcbiAgICB9LFxuICB9LFxuICAvLyBQb3VyIGxlIHN1cHBvcnQgZGVzIGltcG9ydHMgSlNPTlxuICBqc29uOiB7XG4gICAgc3RyaW5naWZ5OiB0cnVlXG4gIH1cbn0pO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUErVCxTQUFTLG9CQUFvQjtBQUM1VixPQUFPLFdBQVc7QUFDbEIsT0FBTyxVQUFVO0FBRmpCLElBQU0sbUNBQW1DO0FBS3pDLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLFNBQVMsQ0FBQyxNQUFNLENBQUM7QUFBQSxFQUNqQixTQUFTO0FBQUEsSUFDUCxPQUFPO0FBQUE7QUFBQSxNQUVMLEVBQUUsTUFBTSxLQUFLLGFBQWEsS0FBSyxRQUFRLGtDQUFXLE9BQU8sRUFBRTtBQUFBLE1BQzNELEVBQUUsTUFBTSxlQUFlLGFBQWEsS0FBSyxRQUFRLGtDQUFXLGtCQUFrQixFQUFFO0FBQUEsTUFDaEYsRUFBRSxNQUFNLFFBQVEsYUFBYSxLQUFLLFFBQVEsa0NBQVcsV0FBVyxFQUFFO0FBQUEsTUFDbEUsRUFBRSxNQUFNLFVBQVUsYUFBYSxLQUFLLFFBQVEsa0NBQVcsYUFBYSxFQUFFO0FBQUEsSUFDeEU7QUFBQSxFQUNGO0FBQUEsRUFDQSxjQUFjO0FBQUEsSUFDWixTQUFTLENBQUMsY0FBYztBQUFBLElBQ3hCLFNBQVM7QUFBQSxNQUNQO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUFBLEVBQ0EsUUFBUTtBQUFBO0FBQUEsSUFFTixPQUFPO0FBQUEsTUFDTCxZQUFZO0FBQUEsSUFDZDtBQUFBLElBQ0EsT0FBTztBQUFBLE1BQ0wsUUFBUTtBQUFBLFFBQ04sUUFBUTtBQUFBLFFBQ1IsY0FBYztBQUFBLFFBQ2QsUUFBUTtBQUFBLE1BQ1Y7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUFBO0FBQUEsRUFFQSxNQUFNO0FBQUEsSUFDSixXQUFXO0FBQUEsRUFDYjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
