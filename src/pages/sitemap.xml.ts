import {tours,posts} from '../data/tours';
import {siteOrigin} from '../data/urls';
export function GET(){
 const paths=['/','/experiences/','/about/','/contact/',...tours.filter(t=>t.published).map(t=>`/experiences/${t.slug}/`),...(posts.length?['/journal/',...posts.map(post=>`/journal/${post.slug}/`)]:[])];
 const escape=(value:string)=>value.replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;');
 const absolute=(path:string)=>escape(new URL(path,siteOrigin).href);
 const entries=paths.flatMap(path=>[path,'/es'+path].map(localized=>`<url><loc>${absolute(localized)}</loc><xhtml:link rel="alternate" hreflang="en" href="${absolute(path)}"/><xhtml:link rel="alternate" hreflang="es" href="${absolute('/es'+path)}"/><xhtml:link rel="alternate" hreflang="x-default" href="${absolute(path)}"/></url>`)).join('');
 return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${entries}</urlset>`,{headers:{'Content-Type':'application/xml'}});
}
