import adapter from '@sveltejs/adapter-static';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default {
  kit: {
    adapter: adapter({
      pages: 'build',
      assets: 'build',
      fallback: 'index.html',
      precompress: false
    }),
    alias: {
      $lib: 'src/lib',
      $audio: 'src/lib/audio',
      $components: 'src/lib/components',
      $stores: 'src/lib/stores',
      $types: 'src/lib/types',
      $utils: 'src/lib/utils',
      '@ui': resolve(__dirname, '../../../shared/ui-components'),
      '@audio': resolve(__dirname, '../../../shared/audio-core'),
      '@shared': resolve(__dirname, '../../../shared')
    },
    paths: {
      // Use environment variable for GitHub Pages deployment
      // Locally: base = '' (empty)
      // GitHub Pages: base = '/Din-ZAudioToolLibrary'
      base: process.env.NODE_ENV === 'production' ? '/Din-ZAudioToolLibrary' : ''
    }
  }
};
