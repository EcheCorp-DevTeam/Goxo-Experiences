import { defineConfig } from 'astro/config';
import {unlinkSync,existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {loadEnv} from 'vite';
import react from '@astrojs/react';
import keystatic from '@keystatic/astro';
const deploymentEnv=loadEnv(process.env.NODE_ENV||'production',process.cwd(),'PUBLIC_');
const publicRelease=(process.env.PUBLIC_INDEXABLE??deploymentEnv.PUBLIC_INDEXABLE)==='true';
const cmsIntegration=keystatic();
// Keep Keystatic's local API, with a project-owned admin presentation.
const localCMS={...cmsIntegration,hooks:{...cmsIntegration.hooks,'astro:config:setup':options=>{
  cmsIntegration.hooks['astro:config:setup']({...options,injectRoute:route=>options.injectRoute({...route,entrypoint:route.pattern==='/keystatic/[...params]'?'./src/views/Cms.astro':route.entrypoint})});
  options.injectRoute({pattern:'/cms/blog-preview',entrypoint:'./src/views/cms/BlogPreview.astro',prerender:false});
  options.injectRoute({pattern:'/cms/article-preview',entrypoint:'./src/views/cms/ArticlePreview.astro',prerender:false});
  options.injectRoute({pattern:'/es/cms/article-preview',entrypoint:'./src/views/cms/ArticlePreview.astro',prerender:false});
}}};
export default defineConfig({
  output: 'static',
  site: process.env.PUBLIC_SITE_URL || deploymentEnv.PUBLIC_SITE_URL || 'https://goxoexperiences.com',
  i18n: {defaultLocale: 'en', locales: ['en','es'], routing: {prefixDefaultLocale: false}},
  devToolbar: {enabled: false},
  // Keystatic's local API and client routes do not append trailing slashes.
  trailingSlash: process.env.NODE_ENV==='development'?'ignore':'always',
  integrations: [react(),...(process.env.NODE_ENV==='development'?[localCMS]:[]),{
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
