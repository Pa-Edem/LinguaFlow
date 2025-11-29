import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { configDefaults } from 'vitest/config';

export default defineConfig({
  plugins: [vue()],
  optimizeDeps: {
    force: true,
  },

  server: {
    port: 5173,
    strictPort: false,
    host: true,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    exclude: [...configDefaults.exclude, 'node_modules', 'dist'],
  },
});
