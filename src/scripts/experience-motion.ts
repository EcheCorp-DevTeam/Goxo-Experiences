import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/** Scoped motion: delegation survives catalogue filters, translations and editor updates. */
export function createExperienceMotion(enabled: () => boolean) {
  const grid = document.querySelector<HTMLElement>('#tours-grid');
  const desktop = matchMedia('(min-width: 761px) and (hover: hover) and (pointer: fine)');
  const events = new AbortController();
  const seen = new Set<string>();
  const animations = new Set<Animation>();
  const lens = document.createElement('span');
  lens.className = 'tour-magnifier';
  lens.setAttribute('aria-hidden', 'true');
  let context: ReturnType<typeof gsap.context> | undefined;
  let active: HTMLElement | null = null, frame = 0, x = 0, y = 0;
  let wasEnabled: boolean | undefined, introduced = false;
  const reset = () => {
    cancelAnimationFrame(frame); frame = 0;
    lens.remove();
    if (active) {
      active.removeAttribute('data-hover'); active = null;
    }
  };
  const paint = () => {
    frame = 0;
    if (!active || !enabled()) return;
    const photo = active.querySelector<HTMLImageElement>('img');
    if (!photo?.complete || !photo.naturalWidth) return;
    const rect = active.getBoundingClientRect();
    const px = Math.max(0, Math.min(rect.width, x - rect.left));
    const py = Math.max(0, Math.min(rect.height, y - rect.top));
    const diameter = Math.min(144, rect.width * .55), magnification = 2;
    // Match object-fit: cover and the photo's resting 1.04 scale before magnifying.
    const fit = Math.max(rect.width / photo.naturalWidth, rect.height / photo.naturalHeight) * 1.04;
    const width = photo.naturalWidth * fit, height = photo.naturalHeight * fit;
    lens.style.width = lens.style.height = `${diameter}px`;
    lens.style.left = `${px}px`; lens.style.top = `${py}px`;
    lens.style.backgroundImage = `url(${JSON.stringify(photo.currentSrc || photo.src)})`;
    lens.style.backgroundSize = `${width * magnification}px ${height * magnification}px`;
    lens.style.backgroundPosition = `${diameter / 2 - (px - (rect.width - width) / 2) * magnification}px ${diameter / 2 - (py - (rect.height - height) / 2) * magnification}px`;
    if (lens.parentElement !== active) active.append(lens);
    active.dataset.hover = 'true';
  };
  grid?.addEventListener('pointermove', event => {
    if (!enabled() || !desktop.matches || event.pointerType === 'touch') return;
    const next = (event.target as Element).closest<HTMLElement>('.tour-card-photo');
    if (next !== active) { reset(); active = next; }
    x = event.clientX; y = event.clientY;
    if (active && !frame) frame = requestAnimationFrame(paint);
  }, { passive: true, signal: events.signal });
  grid?.addEventListener('pointerleave', reset, { signal: events.signal });
  grid?.addEventListener('focusout', reset, { signal: events.signal });
  window.addEventListener('scroll', reset, { passive: true, signal: events.signal });
  window.addEventListener('resize', reset, { passive: true, signal: events.signal });

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
        { transform: 'scale(1.16) translateY(2%)' },
        { transform: 'scale(1.04) translateY(0)' },
      ], { duration: desktop.matches ? 1500 : 900, easing: 'cubic-bezier(.22,1,.36,1)' });
      animations.add(animation);
      animation.onfinish = () => { animations.delete(animation); animation.cancel(); };
      // Pointer input owns the image immediately; an entrance must never fight a gesture.
      card.addEventListener('pointerenter', () => { animation.cancel(); animations.delete(animation); }, { once: true, signal: events.signal });
    }
  }, { threshold: .12 });
  const observeCards = () => {
    observer.disconnect(); reset();
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
    reset();
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
  document.addEventListener('visibilitychange', () => { if (document.hidden) reset(); }, { signal: events.signal });
  sync();
  return () => {
    events.abort(); observer.disconnect(); mutations.disconnect(); reset(); context?.revert();
    animations.forEach(animation => animation.cancel()); animations.clear();
  };
}
