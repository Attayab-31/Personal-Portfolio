import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { createWorld } from './world.js';
import './style.css';

gsap.registerPlugin(ScrollTrigger);
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const world = createWorld(document.querySelector('#world-canvas'));
let lenis;

// Native scrolling remains intact; Lenis only smooths wheel input and respects reduced motion.
if (!reducedMotion) {
  lenis = new Lenis({ duration: 1.05, smoothWheel: true, wheelMultiplier: 0.92, anchors: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

gsap.to('.scroll-progress span', { scaleX: 1, ease: 'none', scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: 0.2 } });

if (!reducedMotion) {
  gsap.utils.toArray('.hero .reveal').forEach((element) => {
    gsap.set(element, { y: 0, autoAlpha: 1, clearProps: 'transform,opacity,visibility' });
  });

  gsap.utils.toArray('.reveal').filter((element) => !element.closest('.hero')).forEach((element) => {
    gsap.fromTo(element, { y: 28, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.85, ease: 'power3.out', scrollTrigger: { trigger: element, start: 'top 88%', once: true } });
  });
}

document.querySelectorAll('[data-world-stage]').forEach((chapter) => {
  ScrollTrigger.create({
    trigger: chapter,
    start: 'top 58%',
    end: 'bottom 42%',
    onEnter: () => world.setStage(chapter.dataset.worldStage),
    onEnterBack: () => world.setStage(chapter.dataset.worldStage),
    onUpdate: (self) => world.setScrollProgress(self.progress),
  });
});

const workSection = document.querySelector('.work-section');
const projectTrack = document.querySelector('.projects-track');
const progressFill = document.querySelector('.work-progress-fill');
const workCount = document.querySelector('.work-count');
const mm = gsap.matchMedia();
mm.add('(min-width: 920px) and (prefers-reduced-motion: no-preference)', () => {
  const distance = () => Math.max(0, projectTrack.scrollWidth - window.innerWidth + 80);
  const tween = gsap.to(projectTrack, {
    x: () => -distance(), ease: 'none',
    scrollTrigger: {
      trigger: workSection, start: 'top top', end: () => `+=${distance()}`, pin: '.work-pin', scrub: 0.8, invalidateOnRefresh: true,
      onUpdate: (self) => {
        if (progressFill) progressFill.style.transform = `scaleX(${self.progress})`;
        if (workCount) workCount.textContent = `${String(Math.min(3, Math.floor(self.progress * 3) + 1)).padStart(2, '0')} — 03`;
      },
    },
  });
  return () => { tween.scrollTrigger?.kill(); tween.kill(); };
});

const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.desktop-nav');
const setMenuOpen = (open) => {
  menuButton?.setAttribute('aria-expanded', String(open));
  menuButton?.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  nav?.classList.toggle('nav-open', open);
  document.body.classList.toggle('menu-open', open);
  if (open && window.innerWidth <= 919) nav?.querySelector('a')?.focus();
};
menuButton?.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') === 'true';
  setMenuOpen(!open);
});
nav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  setMenuOpen(false);
}));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    const wasOpen = menuButton?.getAttribute('aria-expanded') === 'true';
    setMenuOpen(false);
    if (wasOpen && window.innerWidth <= 919) menuButton?.focus();
  }
});
document.addEventListener('click', (event) => {
  if (!nav?.classList.contains('nav-open')) return;
  if (nav.contains(event.target) || menuButton?.contains(event.target)) return;
  setMenuOpen(false);
});
window.addEventListener('resize', () => {
  if (window.innerWidth > 919) setMenuOpen(false);
});

if ('IntersectionObserver' in window) {
  const navigationLinks = [...document.querySelectorAll('.desktop-nav a[href^="#"]')];
  const sections = navigationLinks
    .map((link) => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  const sectionObserver = new IntersectionObserver((entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    navigationLinks.forEach((link) => {
      const active = link.getAttribute('href') === `#${visible.target.id}`;
      if (active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }, { rootMargin: '-20% 0px -55%', threshold: [0, 0.15, 0.35] });

  sections.forEach((section) => sectionObserver.observe(section));
}

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (event) => {
    const hash = link.getAttribute('href');
    const target = hash === '#top' ? document.body : hash ? document.querySelector(hash) : null;
    if (!target) return;
    event.preventDefault();
    setMenuOpen(false);
    const top = hash === '#top'
      ? 0
      : window.scrollY + target.getBoundingClientRect().top;
    window.scrollTo(0, top);
    const nextHash = hash === '#top' ? '#top' : hash;
    if (window.location.hash !== nextHash) history.pushState(null, '', nextHash);
    if (hash === '#main-content') target.setAttribute('tabindex', '-1');
  });
});

document.querySelectorAll('a[target="_blank"]').forEach((link) => {
  const rel = new Set((link.getAttribute('rel') || '').split(/\s+/).filter(Boolean));
  rel.add('noopener');
  rel.add('noreferrer');
  link.setAttribute('rel', [...rel].join(' '));
});

const copyEmail = async (email) => {
  try {
    await navigator.clipboard.writeText(email);
    return true;
  } catch {
    const input = document.createElement('textarea');
    input.value = email;
    input.setAttribute('readonly', '');
    input.style.position = 'fixed';
    input.style.opacity = '0';
    document.body.appendChild(input);
    input.select();
    const copied = document.execCommand('copy');
    input.remove();
    return copied;
  }
};

const copyButton = document.querySelector('[data-copy-email]');
const copyStatus = document.querySelector('.copy-email-status');
copyButton?.addEventListener('click', async () => {
  const email = copyButton.dataset.copyEmail;
  const copied = await copyEmail(email);
  copyStatus.textContent = copied ? 'Email address copied.' : `Copy this address: ${email}`;
});

if (window.matchMedia('(hover: hover) and (pointer: fine)').matches && !reducedMotion) {
  document.querySelectorAll('.project-card').forEach((card) => {
    card.addEventListener('pointermove', (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      card.style.setProperty('--tilt-x', `${-y * 1.5}deg`);
      card.style.setProperty('--tilt-y', `${x * 1.5}deg`);
    });
    card.addEventListener('pointerleave', () => {
      card.style.setProperty('--tilt-x', '0deg');
      card.style.setProperty('--tilt-y', '0deg');
    });
  });
}

document.querySelector('#year').textContent = new Date().getFullYear();
window.addEventListener('load', () => ScrollTrigger.refresh());
window.addEventListener('pagehide', () => { mm.revert(); lenis?.destroy(); world.destroy(); });
