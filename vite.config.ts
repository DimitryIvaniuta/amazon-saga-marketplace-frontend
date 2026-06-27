import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 4173,
    strictPort: true,
    proxy: {
      '/api': { target: process.env.VITE_API_PROXY_TARGET ?? 'http://localhost:8080', changeOrigin: true },
      '/oauth2': { target: process.env.VITE_API_PROXY_TARGET ?? 'http://localhost:8080', changeOrigin: true },
    },
  },
  preview: { port: 4173, strictPort: true },
  build: {
    target: 'baseline-widely-available',
    sourcemap: process.env.VITE_BUILD_SOURCEMAP === 'true',
    reportCompressedSize: true,
  },
  test: {
    globals: true,
    include: ['src/**/*.test.{ts,tsx}'],
    exclude: ['e2e/**', 'node_modules/**', 'dist/**'],
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json-summary'],
      include: [
        'src/api/client.ts',
        'src/api/retry.ts',
        'src/auth/authStorage.ts',
        'src/utils/*.ts',
        'src/hooks/useOnlineStatus.ts',
        'src/components/system/AppErrorBoundary.tsx',
        'src/components/system/ToastProvider.tsx',
        'src/components/ui/Button.tsx',
      ],
      exclude: ['src/**/*.test.{ts,tsx}', 'src/test/**'],
      thresholds: { lines: 80, functions: 80, branches: 65, statements: 80 },
    },
  },
});
