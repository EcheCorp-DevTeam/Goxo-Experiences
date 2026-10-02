import { defineConfig } from 'astro/config';
import {unlinkSync,existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {loadEnv} from 'vite';
const deploymentEnv=loadEnv(process.env.NODE_ENV||'production',process.cwd(),'PUBLIC_');
const publicRelease=(process.env.PUBLIC_INDEXABLE??deploymentEnv.PUBLIC_INDEXABLE)==='true';
export default defineConfig({
  output: 'static',
  site: process.env.PUBLIC_SITE_URL || deploymentEnv.PUBLIC_SITE_URL || 'https://goxoexperiences.com',
  i18n: {defaultLocale: 'en', locales: ['en','es'], routing: {prefixDefaultLocale: false}},
  devToolbar: {enabled: false},
  trailingSlash: 'always',
  integrations: [{
    name: 'separate-command-caches',
    hooks: {
      // Building while dev is running must not invalidate its optimized viewer modules.
      'astro:config:setup': ({ command, updateConfig }) => {
        updateConfig({ vite: { cacheDir: `node_modules/.vite-${command}` } });
      },
      'astro:build:done': ({dir}) => {
        if(!publicRelease)return;
        // Only these exact generated files inside Astro's output directory.
        for(const relative of ['admin/index.html','experiencias/detalle/index.html']){
          const target=fileURLToPath(new URL(relative,dir));
          if(existsSync(target))unlinkSync(target);
        }
      },
    },
  }],
});
