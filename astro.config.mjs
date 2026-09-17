import { defineConfig } from 'astro/config';
export default defineConfig({
  output: 'static',
  trailingSlash: 'always',
  vite: {
    optimizeDeps: {
      include: ['@photo-sphere-viewer/core', '@photo-sphere-viewer/markers-plugin', 'three'],
    },
  },
  integrations: [{
    name: 'separate-command-caches',
    hooks: {
      // Building while dev is running must not invalidate its optimized viewer modules.
      'astro:config:setup': ({ command, updateConfig }) => {
        updateConfig({ vite: { cacheDir: `node_modules/.vite-${command}` } });
      },
    },
  }],
});
