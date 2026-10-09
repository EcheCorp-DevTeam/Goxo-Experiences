export const STORAGE_KEY='goxo:content:v1';
const fields=['short','name','location','duration','eyebrow','description','story','faq'];
export function safeImage(value:unknown):value is string{return typeof value==='string'&&value.length<2800000&&(/^\/media\/(?:[a-zA-Z0-9_-]+\/)*[a-zA-Z0-9_-]+\.(webp|jpe?g|png)$/i.test(value)||/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(value))}
export function validateState(value:any,sceneIds:string[]){
 if(!value||value.version!==1||!Array.isArray(value.tours)||value.tours.length>60)throw new Error('Invalid content format');
 const ids=new Set();
 for(const tour of value.tours){
  if(!tour||typeof tour.id!=='string'||!/^[a-z][a-z0-9-]{0,60}$/.test(tour.id)||ids.has(tour.id))throw new Error('Invalid or duplicate experience');ids.add(tour.id);
  if(!['costa','vino','gastronomia','cultura'].includes(tour.category)||!(tour.image===''||safeImage(tour.image)))throw new Error('Invalid category or image');
  for(const field of fields){const c=tour[field];if(!c||typeof c.es!=='string'||typeof c.en!=='string'||c.es.length>2400||c.en.length>2400)throw new Error('Invalid bilingual content')}
  if(!tour.short.es.trim()||!tour.short.en.trim()||!tour.name.es.trim()||!tour.name.en.trim())throw new Error('Missing experience name');
  for(const field of ['stops','stopCopy','includes','excludes'])if(!Array.isArray(tour[field])||tour[field].length>20||tour[field].some((c:any)=>!c||typeof c.es!=='string'||typeof c.en!=='string'||c.es.length>2400||c.en.length>2400))throw new Error('Invalid experience details');
  if(tour.stops.length!==tour.stopCopy.length)throw new Error('Incomplete itinerary');
  if(!Array.isArray(tour.gallery)||tour.gallery.length>8||tour.gallery.some((img:any)=>!safeImage(img)))throw new Error('Invalid gallery');
  if(typeof tour.published!=='boolean'||typeof tour.immersive!=='boolean')throw new Error('Invalid experience status');
 }
 if(!Array.isArray(value.sceneOrder)||value.sceneOrder.length!==sceneIds.length||new Set(value.sceneOrder).size!==sceneIds.length||value.sceneOrder.some((id:any)=>!sceneIds.includes(id)))throw new Error('Invalid panorama sequence');
 return structuredClone(value);
}
export const tourLanguages=['es','en'] as const;
export function makeWhatsAppMessage(input:{name:string;email:string;guests:number;date:string;message:string;tour:string;tourLang?:string},lang='es'){
 const {name,email,guests,date,message,tour,tourLang=''}=input;
 if(tourLang&&!tourLanguages.includes(tourLang as any))throw new Error('Invalid tour language');
 if(!name.trim()||name.length>80||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>150||!Number.isInteger(guests)||guests<2||guests>8||message.length>1500)throw new Error('Please review your enquiry');
 if(date&&!/^\d{4}-\d{2}-\d{2}$/.test(date))throw new Error('Invalid date');
 return lang==='en'?`Kaixo Endika, I’m ${name.trim()}.\nI’m interested in: ${tour}.\nGuests: ${guests}.\n${tourLang?`Preferred language: ${tourLang==='en'?'English':'Spanish'}.\n`:''}${date?`Date: ${date}.\n`:''}Email: ${email.trim()}.\n${message.trim()}`:`Kaixo Endika, soy ${name.trim()}.\nMe interesa: ${tour}.\nPersonas: ${guests}.\n${tourLang?`Idioma del tour: ${tourLang==='en'?'inglés':'español'}.\n`:''}${date?`Fecha: ${date}.\n`:''}Correo: ${email.trim()}.\n${message.trim()}`;
}
export function tourHref(tour:any,baseIds:string[]){return baseIds.includes(tour.id)?(tour.slug?`/experiences/${tour.slug}/`:`/experiencias/${tour.id}/`):`/experiencias/detalle/?id=${encodeURIComponent(tour.id)}`}
