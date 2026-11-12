import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/** Scoped motion survives catalogue filters, translations and editor updates. */
export function createExperienceMotion(enabled: () => boolean) {
  const grid = document.querySelector<HTMLElement>('#tours-grid');
  const desktop = matchMedia('(min-width: 761px) and (hover: hover) and (pointer: fine)');
  const events = new AbortController();
  const seen = new Set<string>();
  const animations = new Set<Animation>();
  let context: ReturnType<typeof gsap.context> | undefined;
  let wasEnabled: boolean | undefined, introduced = false;
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      const card = entry.target as HTMLElement;
      const id = card.closest<HTMLElement>('[data-tour-card]')?.dataset.tourCard || '';
      observer.unobserve(card);
      if (seen.has(id)) continue;
      seen.add(id);
      if (!enabled()) continue;
      const photo = card.querySelector('img');
      if (!photo) continue;
      const animation = photo.animate([
        { opacity: .75 },
        { opacity: 1 },
      ], { duration: desktop.matches ? 1500 : 900, easing: 'cubic-bezier(.22,1,.36,1)' });
      animations.add(animation);
      animation.onfinish = () => { animations.delete(animation); animation.cancel(); };
    }
  }, { threshold: .12 });
  const observeCards = () => {
    observer.disconnect();
    grid?.querySelectorAll<HTMLElement>('.tour-card-photo').forEach(card => observer.observe(card));
    ScrollTrigger.refresh();
  };
  const mutations = new MutationObserver(observeCards);
  if (grid) { mutations.observe(grid, { childList: true }); observeCards(); }

  const sync = () => {
    const on = enabled();
    if (wasEnabled === on) return;
    wasEnabled = on;
    context?.revert(); context = undefined;
    animations.forEach(animation => animation.cancel()); animations.clear();
    if (!on) return;
    context = gsap.context(() => {
      if (!introduced) {
        introduced = true;
        const lines = document.querySelectorAll('.hero h1 > *');
        if (lines.length) gsap.fromTo(lines,
          { clipPath: 'inset(0 0 100% 0)', yPercent: 18 },
          { clipPath: 'inset(-15% -5% -15% -5%)', yPercent: 0, duration: 1.4,
            stagger: .12, ease: 'power3.out', clearProps: 'all' });
      }
      if (desktop.matches) {
        const landscape = document.querySelector('.immersive-feature > img');
        if (landscape) gsap.fromTo(landscape, { yPercent: -7 }, {
          yPercent: 7, ease: 'none', scrollTrigger: {
            trigger: '.immersive-feature', start: 'top bottom', end: 'bottom top', scrub: .8,
          },
        });
      }
    });
  };
  const viewportChange = () => { wasEnabled = undefined; sync(); };
  desktop.addEventListener('change', viewportChange, { signal: events.signal });
  window.addEventListener('goxo:motion', sync, { signal: events.signal });
  sync();
  return () => {
    events.abort(); observer.disconnect(); mutations.disconnect(); context?.revert();
    animations.forEach(animation => animation.cancel()); animations.clear();
  };
}
