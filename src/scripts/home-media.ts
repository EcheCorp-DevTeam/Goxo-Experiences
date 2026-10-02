function initializeMedia(){
const events=new AbortController();
const on=(target:any,type:string,handler:any,options:any={})=>target.addEventListener(type,handler,{...options,signal:events.signal});
let disposeObserver=()=>{};
const background = document.querySelector<HTMLVideoElement>('#hero-video');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const connection = (navigator as Navigator & {connection?: {saveData?: boolean; effectiveType?: string}}).connection;
let ready = false;
let visible = true;

function syncBackground() {
  if (!background) return;
  const allowed = ready && visible && !document.hidden && !reduced.matches
    && document.documentElement.dataset.motion !== 'off'
    && !connection?.saveData && !['slow-2g', '2g'].includes(connection?.effectiveType || '')
    && !document.querySelector('dialog[open]');
  if (!allowed) { background.pause(); return; }
  if (!background.getAttribute('src')) background.src = background.dataset.src!;
  background.play().catch(() => background.removeAttribute('data-playing'));
}

if (background) {
  background.addEventListener('playing', () => {
    background.dataset.playing = '';
    syncBackground();
  });
  background.addEventListener('error', () => background.removeAttribute('data-playing'));
  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    syncBackground();
  });
  observer.observe(background); disposeObserver=()=>observer.disconnect();
  // The poster and claim paint first. No video URL is exposed to the preload scanner.
  const start = () => requestAnimationFrame(() => requestAnimationFrame(() => {
    const load = () => { ready = true; syncBackground(); };
    if ('requestIdleCallback' in window) window.requestIdleCallback(load, {timeout: 1500});
    else setTimeout(load, 0);
  }));
  if (document.readyState === 'complete') start();
  else on(window,'load', start, {once: true});
  on(window,'goxo:motion', syncBackground);
  on(reduced,'change', syncBackground);
  on(document,'visibilitychange', syncBackground);
  on(window,'pagehide', () => { background.pause(); observer.disconnect(); });
}

const presentation = document.querySelector<HTMLVideoElement>('#host-video');
const play = document.querySelector<HTMLButtonElement>('#host-play');
const error = document.querySelector<HTMLElement>('#host-video-error');
function showPresentationError() {
  if (error) error.hidden = false;
  if (play) { play.hidden = false; play.disabled = false; }
  if (presentation) presentation.hidden = true;
}
play?.addEventListener('click', async () => {
  if (!presentation) return;
  if (error) error.hidden = true;
  play.disabled = true;
  presentation.src = presentation.dataset.src!;
  presentation.hidden = false;
  try {
    await presentation.play();
    play.hidden = true;
    presentation.focus();
  } catch { showPresentationError(); }
  finally { play.disabled = false; }
});
presentation?.addEventListener('error', showPresentationError);
on(document,'visibilitychange', () => { if (document.hidden) presentation?.pause(); });

return ()=>{events.abort();disposeObserver();background?.pause();presentation?.pause();};
}
let cleanupMedia:(()=>void)|undefined;
document.addEventListener('astro:before-swap',()=>cleanupMedia?.());
document.addEventListener('astro:page-load',()=>{cleanupMedia?.();cleanupMedia=initializeMedia();});

