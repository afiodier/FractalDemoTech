import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),   // keeps the `@/*` imports you use
    },
  },
  server: {
    proxy: {
      // Forward API calls to the .NET backend
      '/fractal': {
        target: process.env.VITE_SERVER_ADDRESS || 'http://localhost:5000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/fractal/, '/fractal')
      }
    }
  }
});