import {gsap} from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import {localizedHref,isPublicProduction} from '../data/urls';
import imageAlts from '../data/image-alts';
import settings from '../content/site/settings.json';
import {interfaceCopy} from '../data/interface';
import {STORAGE_KEY,validateState,safeImage,makeEnquiryPayload,tourHref} from './state';
function initializePage(){
const events=new AbortController();
const on=(target:any,type:string,handler:any,options:any={})=>target.addEventListener(type,handler,{...options,signal:events.signal});
const $=(selector:string):any=>document.querySelector(selector);
const $$=(selector:string):any[]=>Array.from(document.querySelectorAll(selector));
$$('.experiences-menu').forEach(dropdown=>{
 const toggle=dropdown.querySelector('.experiences-toggle'),submenu=dropdown.querySelector('.experiences-submenu');
 const setOpen=(open:boolean)=>{submenu.hidden=!open;toggle.setAttribute('aria-expanded',String(open))};
 on(dropdown,'pointerenter',(event:PointerEvent)=>{if(dropdown.closest('.desktop-nav')&&event.pointerType==='mouse'&&matchMedia('(hover:hover)').matches)setOpen(true)});
 on(dropdown,'pointerleave',()=>{if(!dropdown.contains(document.activeElement))setOpen(false)});
 on(dropdown,'focusout',(event:FocusEvent)=>{if(!dropdown.contains(event.relatedTarget as Node))setOpen(false)});
 on(dropdown,'keydown',(event:KeyboardEvent)=>{if(event.key==='Escape'){toggle.focus();setOpen(false);event.stopPropagation()}});
 on(toggle,'click',()=>setOpen(submenu.hidden));
 on(dropdown,'click',(event:MouseEvent)=>{if((event.target as Element).closest('a'))setOpen(false)});
});
const hero=document.querySelector<HTMLElement>('#hero');
const header=document.querySelector<HTMLElement>('.site-header');
let headerObserver:IntersectionObserver|undefined;
if(hero&&header){
 const updateHeader=()=>{
  const overVideo=hero.getBoundingClientRect().bottom>header.offsetHeight;
  header.classList.toggle('over-video',overVideo);
  const logo=header.querySelector<HTMLImageElement>('.brand-logo');
  if(logo)logo.src=settings.logo;
 };
 on(window,'scroll',updateHeader,{passive:true});on(window,'resize',updateHeader);
 headerObserver=new IntersectionObserver(updateHeader);headerObserver.observe(hero);updateHeader();
}
const seed=JSON.parse($('#goxo-data').textContent);
const baseIds=seed.tours.map((t:any)=>t.id),sceneIds=seed.media.panoramas.map((p:any)=>p.id);
const defaults={version:1,tours:seed.tours,sceneOrder:sceneIds};
let state=structuredClone(defaults),lang=document.documentElement.lang==='en'?'en':'es';
const isPreview=false; // Keystatic files are the only editable source of public content.
try{const raw=isPreview?localStorage.getItem(STORAGE_KEY):null;if(raw)state=validateState(JSON.parse(raw),sceneIds)}catch{}
const copy=(c:any)=>typeof c==='string'?c:(c?.[lang]||c?.es||'');
const say=(es:string,en:string)=>interfaceCopy[en]?.[lang]||(lang==='es'?es:en);
const text=(element:any,content:any)=>{if(element)element.textContent=content};
const localWrite=(key:string,value:string)=>{try{localStorage.setItem(key,value);return true}catch{return false}};
function toast(message:string){const el=$('#toast');text(el,message);el.hidden=false;clearTimeout((toast as any).timer);(toast as any).timer=setTimeout(()=>{el.hidden=true},4500)}
function translated(element:any,content:any){element.dataset.es=content.es;element.dataset.en=content.en;text(element,copy(content))}
function translate(){document.documentElement.lang=lang;$$('[data-es][data-en]').forEach(el=>text(el,el.dataset[lang]));document.dispatchEvent(new Event('goxo:language'))}

const languageLink=$('#language-toggle');
const pagePath=localizedHref(location.pathname,'en');
let languageRequest:AbortController|undefined;
function updateLanguageLinks(){
 $$('a[href]').forEach(a=>{const href=a.getAttribute('href');if(a!==languageLink&&href?.startsWith('/')&&!href.startsWith('//'))a.setAttribute('href',localizedHref(href,lang))});
 if(languageLink){const target=lang==='en'?'es':'en';languageLink.href=localizedHref(location.pathname,target)+location.search+location.hash;languageLink.hreflang=target;text(languageLink.querySelector('[data-language-label]'),target.toUpperCase());languageLink.querySelector('img').src=`/media/flags/${target}.svg`;languageLink.setAttribute('aria-label',lang==='en'?'Cambiar a español':'Switch to English')}
}
async function changeLanguage(next:string,push=true){
 languageRequest?.abort();languageRequest=new AbortController();
 const request=languageRequest;
 lang=next==='es'?'es':'en';
 const url=localizedHref(location.pathname,lang)+location.search+location.hash;
 if(push)history.pushState(null,'',url);
 translate();updateLanguageLinks();updateMotionButtons();
 const preferredLanguage=$('[data-default-tour-language]');if(preferredLanguage&&!preferredLanguage.dataset.userSelected)preferredLanguage.value=lang;
 $$('[data-tour-image]').forEach(img=>{const tour=state.tours.find((t:any)=>t.id===img.dataset.tourImage);if(tour)img.alt=copy(tour.imageAlt)});
 $$('img[data-alt-en]').forEach(img=>img.alt=lang==='en'?img.dataset.altEn:img.dataset.altEs);
 $$('img[alt]').forEach(img=>{const alt=imageAlts[new URL(img.src,location.href).pathname];if(img.alt&&alt)img.alt=copy(alt)});
 $$('#contact-tour option').forEach(option=>{const tour=state.tours.find((t:any)=>t.id===option.value);text(option,tour?copy(tour.short):say('Quiero una recomendación','I’d like a recommendation'))});
 $$('#detail-gallery button').forEach((button,i)=>{button.setAttribute('aria-label',say('Ampliar fotografía ','Expand photograph ')+(i+1));text(button.querySelector('span'),say('Ampliar','Expand'))});
 // Read the equivalent static page for its SEO and accessibility labels.
 // Keep the live DOM, video, forms, dialogs and scroll position intact.
 try{
  const response=await fetch(url,{signal:request.signal,cache:'no-cache'});if(!response.ok)return;
  const translatedPage=new DOMParser().parseFromString(await response.text(),'text/html');
  if(events.signal.aborted||request.signal.aborted||location.pathname+location.search+location.hash!==url||document.documentElement.lang!==next)return;
  document.title=translatedPage.title;
  for(const selector of ['meta[name="description"]','link[rel="canonical"]','meta[property^="og:"]','meta[name^="twitter:"]']){const sources=Array.from(translatedPage.querySelectorAll(selector));$$(selector).forEach((target,i)=>{const source=sources[i];if(target&&source)target.setAttribute(target.tagName==='META'?'content':'href',source.getAttribute(target.tagName==='META'?'content':'href')||'')})}
  const graph=translatedPage.querySelector('#seo-graph');if(graph)text($('#seo-graph'),graph.textContent);
  for(const selector of ['[aria-label]','[placeholder]']){const sources=Array.from(translatedPage.querySelectorAll(selector));$$(selector).forEach((target,i)=>{const source=sources[i];if(source&&source.tagName===target.tagName&&target!==languageLink){const attr=selector==='[aria-label]'?'aria-label':'placeholder';target.setAttribute(attr,source.getAttribute(attr)||'')}})}
 }catch{/* Existing bilingual content remains usable when offline. */}
}
languageLink?.addEventListener('click',(event:MouseEvent)=>{if(event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;event.preventDefault();void changeLanguage(lang==='en'?'es':'en')});
on(window,'popstate',()=>{if(localizedHref(location.pathname,'en')===pagePath)void changeLanguage(location.pathname.startsWith('/es/')?'es':'en',false)});
updateLanguageLinks();
const menu=$('.menu-toggle');menu?.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?say('Cerrar menú','Close menu'):say('Abrir menú','Open menu'));$('#mobile-nav').hidden=!open});
on(document,'keydown',event=>{if(event.key==='Escape'&&menu?.getAttribute('aria-expanded')==='true'){menu.setAttribute('aria-expanded','false');$('#mobile-nav').hidden=true;menu.focus()}});
$$('#mobile-nav a').forEach(el=>el.addEventListener('click',()=>{$('#mobile-nav').hidden=true;menu.setAttribute('aria-expanded','false')}));
let motionPaused=document.documentElement.dataset.motion==='off';
try{motionPaused=localStorage.getItem('goxo:motion')==='off'}catch{}
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let modalOpen=false;const canAnimate=()=>!motionPaused&&!reduced.matches&&!modalOpen;
const motionSignal=()=>window.dispatchEvent(new Event('goxo:motion'));
function updateMotionButtons(){const paused=motionPaused||reduced.matches;document.documentElement.dataset.motion=paused?'off':'on';const b=$('#motion-toggle');text(b,reduced.matches?say('Movimiento reducido','Reduced motion'):paused?say('Activar movimiento','Enable motion'):say('Pausar movimiento','Pause motion'));b?.setAttribute('aria-pressed',String(paused));if(b)b.disabled=reduced.matches;const h=$('#hero-motion');if(h){h.textContent=paused?'▷':'Ⅱ';h.setAttribute('aria-label',paused?say('Activar animaciones','Enable animations'):say('Pausar animaciones','Pause animations'));h.disabled=reduced.matches}motionSignal()}
function toggleMotion(){motionPaused=!motionPaused;localWrite('goxo:motion',motionPaused?'off':'on');updateMotionButtons()}
$('#motion-toggle')?.addEventListener('click',toggleMotion);$('#hero-motion')?.addEventListener('click',toggleMotion);on(reduced,'change',updateMotionButtons);
gsap.registerPlugin(ScrollTrigger);
let activeTerritory=seed.tours[0].id;
function selectTerritory(id:string){const tour=state.tours.find((t:any)=>t.id===id&&t.published);if(!tour)return false;activeTerritory=id;const img=$('#hero-landscape');if(img){gsap.killTweensOf(img);const apply=()=>{img.src=tour.image;img.alt=copy(tour.location)};if(canAnimate()){const preload=new Image();preload.src=tour.image;preload.decode().then(()=>{if(activeTerritory!==id)return;if(!canAnimate()){apply();gsap.set(img,{opacity:1});return}gsap.to(img,{opacity:.25,duration:.45,ease:'sine.inOut',onComplete:()=>{apply();gsap.to(img,{opacity:1,duration:.8,ease:'sine.inOut'})}})}).catch(()=>{if(activeTerritory===id)gsap.set(img,{opacity:1})})}else{apply();gsap.set(img,{opacity:1})}}$$('[data-territory]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.territory===id)));const loc=$('#hero-location');if(loc)translated(loc,{es:`${tour.number} / ${tour.short.es.toUpperCase()}`,en:`${tour.number} / ${tour.short.en.toUpperCase()}`});return true}
$$('[data-territory]').forEach(b=>b.addEventListener('click',()=>selectTerritory(b.dataset.territory)));
let selectedFilter='all';
function filterTours(category:string){if(!['all','costa','vino','gastronomia','cultura','multidia'].includes(category))throw new Error('Unknown category');selectedFilter=category;let count=0;$$('[data-tour-card]').forEach(card=>{const tour=state.tours.find((t:any)=>t.id===card.dataset.tourCard);card.hidden=!tour?.published||(category!=='all'&&tour.category!==category);if(!card.hidden)count++});$$('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.filter===category)));if($('#tours-empty'))$('#tours-empty').hidden=count>0;ScrollTrigger.refresh();return count}
$$('[data-filter]').forEach(b=>b.addEventListener('click',()=>filterTours(b.dataset.filter)));
function element(tag:string,className='',content=''){const el=document.createElement(tag);if(className)el.className=className;if(content)el.textContent=content;return el}
function buildCard(tour:any){
 const card=element('article','tour-card');card.dataset.tourCard=tour.id;card.dataset.category=tour.category;
 const href=localizedHref(tourHref(tour,baseIds),lang),link=element('a','tour-card-photo') as HTMLAnchorElement;link.href=href;link.setAttribute('aria-label',copy(tour.short));
 if(tour.image){const img=element('img') as HTMLImageElement;img.src=tour.image;img.alt=copy(tour.imageAlt||{es:'',en:''});img.loading='lazy';img.width=1200;img.height=900;img.dataset.tourImage=tour.id;link.append(img)}else link.append(element('span','tour-photo-pending'));
 const body=element('div','tour-card-body'),name=element('h3'),description=element('p','tour-description'),meta=element('p','tour-card-facts');translated(name,tour.short);name.dataset.tourName=tour.id;translated(description,tour.description);
 translated(meta,tour.facts||tour.duration);
 const more=element('a','button',say('Explorar esta experiencia','Explore This Experience')) as HTMLAnchorElement;more.href=href;
 const plan=element('a','button button-secondary',say('Planifiquemos tu experiencia','Let’s Plan Your Experience')) as HTMLAnchorElement;plan.href=localizedHref('/contact/?tour='+encodeURIComponent(tour.id),lang);
 const actions=element('div','tour-card-actions');actions.append(more,plan);
 body.append(name,description,meta,actions);card.append(link,body);return card;
}
let currentTour:any=null;
function syncPublic(){
 const grid=$('#tours-grid');if(grid&&isPreview){state.tours.forEach((tour:any)=>{let card=Array.from(grid.children).find((c:any)=>c.dataset.tourCard===tour.id);if(card){card.replaceWith(buildCard(tour))}else grid.append(buildCard(tour))});filterTours(selectedFilter)}
 $$('[data-territory]').forEach(button=>{button.hidden=!state.tours.find((tour:any)=>tour.id===button.dataset.territory&&tour.published)});
 if($('#hero-landscape')){const t=state.tours.find((t:any)=>t.id===activeTerritory);if(t){$('#hero-landscape').src=t.image;$('#hero-landscape').alt=copy(t.location)}}
 const detail=$('[data-detail-id]');if(detail){const id=detail.dataset.detailId==='custom'?new URLSearchParams(location.search).get('id'):detail.dataset.detailId;const tour=state.tours.find((t:any)=>t.id===id);if(!tour||(!tour.published&&!new URLSearchParams(location.search).has('preview'))){detail.replaceChildren();detail.className='section-pad error-page';detail.append(element('h1','',say('No disponible','Unavailable')),element('p','',say('Esta experiencia no está visible en tu catálogo.','This experience is not visible in your catalogue.')));const a=element('a','button',say('Volver al catálogo','Back to catalogue')) as HTMLAnchorElement;a.href='/experiencias/';detail.append(a);return}currentTour=tour;if(isPreview)document.title=copy(tour.short)+' · GOXO';if(isPreview)$$('[data-bind]').forEach(el=>translated(el,tour[el.dataset.bind]));$$('[data-bind-image]').forEach(el=>{el.src=tour.image;el.alt=copy(tour.imageAlt||{es:'',en:''})});$$('[data-tour-contact]').forEach(a=>a.href=localizedHref('/contact/?tour='+encodeURIComponent(tour.id),lang));$$('[data-tour-whatsapp]').forEach(a=>a.href='https://wa.me/'+settings.whatsapp+'?text='+encodeURIComponent(say('Kaixo, me interesa ','Kaixo, I’m interested in ')+copy(tour.short)));$$('[data-tour-immersive]').forEach(b=>b.hidden=!tour.immersive);
 const route=$('#route-grid');if(route&&isPreview){route.replaceChildren();tour.stops.forEach((stop:any,i:number)=>{const a=element('article','route-step'),h=element('h3'),p=element('p');translated(h,stop);translated(p,tour.stopCopy[i]);a.append(element('span','',String(i+1).padStart(2,'0')),h,p);route.append(a)});}
 if(isPreview)for(const field of ['includes','excludes']){const list=$('#tour-'+field);if(!list)continue;list.replaceChildren();tour[field]?.forEach((item:any)=>{const li=element('li');translated(li,item);list.append(li)})}renderDetailGallery();
 }
 const select=$('#contact-tour');if(select){const selected=select.value||new URLSearchParams(location.search).get('tour');select.replaceChildren();const opt=element('option','',say('Quiero una recomendación','I’d like a recommendation')) as HTMLOptionElement;opt.value='personalizada';select.append(opt);state.tours.filter((t:any)=>t.published).forEach((tour:any)=>{const o=element('option','',copy(tour.short)) as HTMLOptionElement;o.value=tour.id;select.append(o)});if(Array.from(select.options).some((o:any)=>o.value===selected))select.value=selected;}
}
function renderDetailGallery(){const grid=$('#detail-gallery');if(!grid)return;if(!isPreview){const buttons=$$('#detail-gallery button');const photos=currentTour?.gallery?.length?currentTour.gallery:buttons.map(b=>b.querySelector('img')?.getAttribute('src')).filter(Boolean);const title=currentTour?copy(currentTour.short):(document.querySelector('.detail-hero h1')?.textContent||'');buttons.forEach((button,i)=>on(button,'click',()=>openGallery(photos,i,title)));return}if(!currentTour)return;const photos=currentTour.gallery?.length?currentTour.gallery:[currentTour.image];grid.replaceChildren();photos.forEach((src:string,i:number)=>{const button=element('button','gallery-tile');button.setAttribute('aria-label',say('Ampliar fotografía ','Expand photograph ')+(i+1));const img=element('img') as HTMLImageElement;img.src=src;img.alt=copy(currentTour.galleryAlts?.[i]||imageAlts[src]||currentTour.short);img.dataset.altEs=(currentTour.galleryAlts?.[i]||imageAlts[src]||currentTour.short).es;img.dataset.altEn=(currentTour.galleryAlts?.[i]||imageAlts[src]||currentTour.short).en;img.loading='lazy';img.width=1000;img.height=700;button.append(img);button.addEventListener('click',()=>openGallery(photos,i,copy(currentTour.short)));grid.append(button)})}
const mediaDialog=$('#media-dialog') as HTMLDialogElement;const immersiveDialog=$('#immersive-dialog') as HTMLDialogElement;let previousFocus:HTMLElement|null=null;
function openDialog(dialog:HTMLDialogElement){previousFocus=document.activeElement as HTMLElement;dialog.showModal();modalOpen=true;motionSignal();dialog.querySelector<HTMLButtonElement>('[data-close-dialog]')?.focus();if(canAnimate())gsap.from(dialog,{opacity:0,duration:.4});}
function closeDialog(dialog:HTMLDialogElement){dialog.close()}
$$('[data-close-dialog]').forEach(b=>on(b,'click',()=>closeDialog(b.closest('dialog'))));
for(const dialog of [mediaDialog,immersiveDialog].filter(Boolean)){on(dialog,'click',(e:MouseEvent)=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close()}});on(dialog,'close',()=>{modalOpen=false;motionSignal();previousFocus?.focus()})}
let galleryPhotos:string[]=[],galleryPosition=0,galleryTitle='';
function showGalleryImage(){const img=$('#lightbox-image');const src=galleryPhotos[galleryPosition];const domImg=$$('#detail-gallery button img')[galleryPosition] as HTMLImageElement|undefined;img.hidden=false;img.src=src;img.alt=copy(currentTour?.galleryAlts?.[galleryPosition]||imageAlts[src]||currentTour?.short||'')||domImg?.alt||galleryTitle;$('#lightbox-video').hidden=true;text($('#media-title'),galleryTitle);text($('#gallery-count'),`${galleryPosition+1} / ${galleryPhotos.length}`);text($('#media-description'),'');$('.gallery-controls').hidden=galleryPhotos.length<2}
function openGallery(photos:string[],index:number,title:string){galleryPhotos=photos;galleryPosition=index;galleryTitle=title;showGalleryImage();openDialog(mediaDialog)}
if($('#gallery-prev'))on($('#gallery-prev'),'click',()=>{galleryPosition=(galleryPosition-1+galleryPhotos.length)%galleryPhotos.length;showGalleryImage()});if($('#gallery-next'))on($('#gallery-next'),'click',()=>{galleryPosition=(galleryPosition+1)%galleryPhotos.length;showGalleryImage()});if(mediaDialog)on(mediaDialog,'keydown',(e:KeyboardEvent)=>{if($('#lightbox-image').hidden)return;if(e.key==='ArrowLeft')$('#gallery-prev').click();if(e.key==='ArrowRight')$('#gallery-next').click()});
function openFilm(){if(immersiveDialog?.open)immersiveDialog.close();const video=$('#lightbox-video') as HTMLVideoElement;$('#lightbox-image').hidden=true;video.hidden=false;video.src=seed.media.video;video.poster=seed.media.coast;$('.gallery-controls').hidden=true;text($('#media-title'),say('Gaztelugatxe, desde el aire.','Gaztelugatxe, from the air.'));text($('#media-description'),say('Video real de Quahadi · CC BY-SA 4.0 · Adaptado a MP4 sin audio.','Real footage by Quahadi · CC BY-SA 4.0 · Adapted to MP4 without audio.'));openDialog(mediaDialog);video.play().catch(()=>{})}
$$('[data-open-film]').forEach(b=>b.addEventListener('click',openFilm));mediaDialog.addEventListener('close',()=>{const video=$('#lightbox-video');video.pause();video.removeAttribute('src');video.load()});$('#lightbox-image')?.addEventListener('error',()=>text($('#media-description'),say('No se pudo cargar esta imagen. Prueba otra fotografía.','This image could not load. Try another photograph.')));$('#lightbox-video')?.addEventListener('error',()=>text($('#media-description'),say('No se pudo reproducir el video. Cierra y vuelve a intentarlo.','The video could not play. Close and try again.')));
const contactForm=$('#contact-form') as HTMLFormElement;
const preferredLanguage=$('[data-default-tour-language]');if(preferredLanguage)on(preferredLanguage,'change',()=>preferredLanguage.dataset.userSelected='true');
$$('[data-values-open]').forEach(button=>on(button,'click',()=>{const open=button.dataset.valuesOpen==='true';$$('#values-list details').forEach(item=>item.open=open)}));
// Horizontal gallery: arrows move one photograph, swiping is native scrolling and the next photographs are fetched ahead.
function setupGalleryCarousel(){const track=$('#detail-gallery');if(!track||!$('[data-gallery-carousel]'))return;const tiles=()=>$$('#detail-gallery .gallery-tile') as HTMLElement[];const prefetch=(from:number)=>tiles().slice(Math.max(0,from),from+2).forEach(tile=>{const img=tile.querySelector('img');if(img&&img.loading==='lazy')img.loading='eager'});const offset=(tile:HTMLElement)=>tile.offsetLeft-(tiles()[0]?.offsetLeft||0);const current=()=>{let index=0;tiles().forEach((tile,i)=>{if(offset(tile)<=track.scrollLeft+8)index=i});return index};const steps=$$('[data-gallery-step]') as HTMLButtonElement[];const update=()=>{const max=track.scrollWidth-track.clientWidth-8;steps.forEach(button=>{button.disabled=Number(button.dataset.galleryStep)<0?track.scrollLeft<=8:track.scrollLeft>=max});prefetch(current()+1)};steps.forEach(button=>on(button,'click',()=>{const list=tiles();const target=list[Math.min(list.length-1,Math.max(0,current()+Number(button.dataset.galleryStep)))];if(!target)return;prefetch(list.indexOf(target)+1);track.scrollTo({left:offset(target),behavior:canAnimate()?'smooth':'auto'})}));on(track,'scroll',update,{passive:true});on(track,'keydown',(e:KeyboardEvent)=>{if(e.target!==track||(e.key!=='ArrowRight'&&e.key!=='ArrowLeft'))return;e.preventDefault();steps.find(button=>Number(button.dataset.galleryStep)===(e.key==='ArrowRight'?1:-1))?.click()});update()}
setupGalleryCarousel();
if(contactForm){const date=contactForm.elements.namedItem('date') as HTMLInputElement;const today=new Date();date.min=[today.getFullYear(),String(today.getMonth()+1).padStart(2,'0'),String(today.getDate()).padStart(2,'0')].join('-');contactForm.addEventListener('submit',async(e)=>{e.preventDefault();if(!contactForm.reportValidity())return;const data=new FormData(contactForm);const multiDay=data.get('tour')==='multi-day';let payload;try{const tour=state.tours.find((t:any)=>t.id===data.get('tour'));payload=makeEnquiryPayload({interests:multiDay?data.getAll('interests').map(String):[],interestsNote:multiDay?String(data.get('interestsNote')||''):'',name:String(data.get('name')),email:String(data.get('email')),guests:Number(data.get('guests')),date:String(data.get('date')||''),tourLang:String(data.get('tourLang')||''),message:String(data.get('message')||''),tour:tour?copy(tour.short):say('Una experiencia personalizada','A personalised experience')},lang)}catch{toast(say('Revisa los datos de tu consulta.','Please review your enquiry details.'));return}
 const endpoint=import.meta.env.PUBLIC_CONTACT_ENDPOINT;if(!endpoint){toast(say(`El envío por correo aún no está activo. Escribe a ${settings.email}.`,`Email sending is not active yet. Please write to ${settings.email}.`));return}
 const submit=contactForm.querySelector('button[type=submit]') as HTMLButtonElement;submit.disabled=true;
 try{const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify(payload)});if(!response.ok)throw new Error('Request failed');contactForm.reset();contactForm.hidden=true;$('#contact-result').hidden=false;$('#contact-result').focus()}catch{toast(say(`No se pudo enviar tu consulta. Inténtalo de nuevo o escribe a ${settings.email}.`,`We couldn't send your enquiry. Please try again or write to ${settings.email}.`))}finally{submit.disabled=false}})}
translate();syncPublic();updateMotionButtons();
on(window,'goxo:motion',()=>{const img=$('#hero-landscape');if(img&&!canAnimate()){gsap.killTweensOf(img);const tour=state.tours.find((t:any)=>t.id===activeTerritory);if(tour){img.src=tour.image;img.alt=copy(tour.location)}gsap.set(img,{opacity:1})}});
if(contactForm){const selected=new URLSearchParams(location.search).get('tour');if(selected&&state.tours.some((t:any)=>t.id===selected&&t.published))$('#contact-tour').value=selected;}
if(contactForm){const tourSelect=$('#contact-tour'),interests=$('#journey-interests');const syncInterests=()=>{const show=tourSelect.value==='multi-day';interests.hidden=!show;if(!show)interests.querySelectorAll('input,textarea').forEach((el:any)=>{if(el.type==='checkbox')el.checked=false;else el.value=''})};on(tourSelect,'change',syncInterests);syncInterests()}
const lifecycle=new AbortController();
const context=(document as any).modelContext;
if(context?.registerTool){const specs=[{name:'list_goxo_experiences',title:'List GOXO experiences',description:'Read published experiences available in the current prototype.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true},execute:async()=>({experiences:state.tours.filter((t:any)=>t.published).map((t:any)=>({id:t.id,title:copy(t.short),category:t.category,url:tourHref(t,baseIds)}))})}];if($('#tours-grid'))specs.push({name:'filter_goxo_experiences',title:'Filter GOXO experiences',description:'Filter the visible catalogue by category. Does not book or contact anyone.',inputSchema:{type:'object',properties:{category:{type:'string',enum:['all','costa','vino','gastronomia','cultura','multidia']}},required:['category'],additionalProperties:false},annotations:{readOnlyHint:false},execute:async(input:any)=>{if(!input||typeof input.category!=='string')throw new Error('Category required');return {visibleCount:filterTours(input.category),category:selectedFilter}}} as any);for(const spec of specs){try{Promise.resolve(context.registerTool(spec,{signal:lifecycle.signal})).catch(()=>{})}catch{}}}
on(window,'pagehide',()=>{lifecycle.abort();gsap.killTweensOf('#hero-landscape');ScrollTrigger.getAll().forEach(t=>t.kill());$('#lightbox-video')?.pause()});

return ()=>{events.abort();headerObserver?.disconnect();languageRequest?.abort();lifecycle.abort();gsap.killTweensOf('#hero-landscape');ScrollTrigger.getAll().forEach(t=>t.kill());document.querySelectorAll('video').forEach(video=>video.pause());};
}
let cleanupPage:(()=>void)|undefined;
document.addEventListener('astro:before-swap',()=>cleanupPage?.());
document.addEventListener('astro:page-load',()=>{cleanupPage?.();cleanupPage=initializePage();});
