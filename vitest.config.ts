import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup/vitest.setup.ts'],
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: ['node_modules', 'dist', '.next', 'tests/e2e'],
    clearMocks: true,
    restoreMocks: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: ['src/**/*.{js,jsx,ts,tsx}'],
      exclude: [
        'src/**/*.d.ts',
        'src/**/*.test.{js,jsx,ts,tsx}',
        'src/**/*.spec.{js,jsx,ts,tsx}',
        'src/app/**/layout.tsx',
        'src/app/**/loading.tsx',
        'src/app/**/not-found.tsx',
        'src/app/**/error.tsx',
        'src/proxy.ts',
        'src/env.ts',
      ],
      thresholds: {
        global: {
          branches: 75,
          functions: 80,
          lines: 85,
          statements: 85,
        },
        'src/lib/auth/**/*.{js,jsx,ts,tsx}': {
          branches: 85,
          functions: 90,
          lines: 90,
          statements: 90,
        },
        'src/lib/file-service.ts': {
          branches: 80,
          functions: 85,
          lines: 85,
          statements: 85,
        },
        'src/server/actions/**/*.{js,jsx,ts,tsx}': {
          branches: 80,
          functions: 85,
          lines: 85,
          statements: 85,
        },
      },
    },
    testTimeout: 30000,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@/tests': resolve(__dirname, './tests'),
    },
  },
})
