/**
 * vitest.config.js
 * Vitest configuration for the audio plugin playground monorepo
 *
 * @module vitest.config
 */

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Test environment
    environment: 'node',

    // Global test setup
    globals: true,

    // Include test files
    include: ['**/*.test.js', '**/*.spec.js'],

    // Exclude patterns
    exclude: ['node_modules', 'dist', '.idea', '.git', '.cache'],

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.test.js',
        '**/*.spec.js',
        '**/index.js', // Public API exports
      ],
      lines: 80,
      functions: 80,
      branches: 80,
      statements: 80,
    },

    // Test timeout (in milliseconds)
    testTimeout: 10000,

    // Reporters
    reporters: ['verbose'],

    // Bail on first test failure (disable for CI)
    bail: 0,

    // Watch mode (auto-rerun on file changes)
    watch: process.env.CI ? false : true,
  },

  resolve: {
    alias: {
      '@audio': new URL('./shared/audio-core', import.meta.url).pathname,
      '@ui': new URL('./shared/ui-components', import.meta.url).pathname,
      '@shared': new URL('./shared', import.meta.url).pathname,
    },
  },
});
