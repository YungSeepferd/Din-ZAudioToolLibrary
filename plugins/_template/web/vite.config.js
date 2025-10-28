import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [svelte()],
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, '../../../shared'),
      '@audio': path.resolve(__dirname, '../../../shared/audio-core'),
      '@ui': path.resolve(__dirname, '../../../shared/ui-components')
    }
  }
});
