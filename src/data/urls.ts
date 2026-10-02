import {tours} from './tours';
export type Language='en'|'es';
export const languageOf=(path:string):Language=>path.startsWith('/es/')?'es':'en';
const aliases:Record<string,string>={'/experiencias/':'/experiences/','/acerca-de/':'/about/','/contacto/':'/contact/','/historias/':'/journal/','/privacidad-y-cookies/':'/privacy-cookies/','/terminos-y-condiciones/':'/terms-conditions/','/politica-de-cancelacion/':'/cancellation-policy/','/creditos/':'/credits/'};
export function localizedHref(href:string,lang:Language){
 if(!href.startsWith('/')||href.startsWith('//'))return href;
 const match=href.match(/^([^?#]*)(.*)$/)!;
 const clean=match[1].replace(/^\/es(?=\/)/,'');
 const tour=tours.find(t=>clean===`/experiencias/${t.id}/`);
 const target=tour?`/experiences/${tour.slug}/`:(aliases[clean]||clean);
 return (lang==='es'?'/es':'')+target+match[2];
}
export const siteOrigin=import.meta.env.PUBLIC_SITE_URL||'https://goxoexperiences.com';
export const isPublicProduction=import.meta.env.PUBLIC_INDEXABLE==='true';
