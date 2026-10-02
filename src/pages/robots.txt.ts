import {siteOrigin,isPublicProduction} from '../data/urls';
export function GET(){
 // Let crawlers read noindex on excluded pages; robots blocking alone does not
 // remove a URL from search results. The editor needs hosting authentication.
 const policy=isPublicProduction?'Allow: /':'Disallow: /';
 return new Response(`User-agent: *\n${policy}\nSitemap: ${siteOrigin}/sitemap.xml\n`,{headers:{'Content-Type':'text/plain'}});
}
