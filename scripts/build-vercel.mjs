import {execFileSync} from 'node:child_process';
const production=process.env.VERCEL_ENV==='production';
if(production){
 execFileSync(process.execPath,['scripts/build-release.mjs'],{stdio:'inherit'});
}else{
 execFileSync(process.execPath,['node_modules/astro/bin/astro.mjs','build'],{stdio:'inherit',env:{...process.env,PUBLIC_INDEXABLE:'false'}});
 execFileSync(process.execPath,['scripts/audit-seo.mjs'],{stdio:'inherit'});
}
