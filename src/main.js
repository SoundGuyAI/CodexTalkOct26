import '@fontsource/archivo-black';
import '@fontsource/inter/400.css';
import '@fontsource/inter/600.css';
import { gsap } from 'gsap';
import { Draggable } from 'gsap/Draggable';
import QRCode from 'qrcode';
import { part1Slides } from './slides/part1.js';
import { part2Slides } from './slides/part2.js';
import './styles.css';
import './slides.css';

gsap.registerPlugin(Draggable);

const slides = [...part1Slides, ...part2Slides];
const deck = document.querySelector('#deck');
const indexFromHash = () => {
  const match = location.hash.match(/(?:slide-)?(\d+)/);
  return Math.max(0, Math.min(slides.length - 1, Number(match?.[1] || 1) - 1));
};
let current = indexFromHash();
let timerStartedAt = null;
let pausedAt = null;
let pausedTotal = 0;
let muted = true;
let audioContext;

deck.innerHTML = `
  <div class="stage" id="stage">
    ${slides.map((slide, index) => `
      <section class="slide ${slide.className || ''}" data-slide="${index + 1}" data-duration="${slide.duration}" aria-hidden="true">
        <div class="slide-inner">${slide.html}</div>
        <aside class="speaker-note" hidden>${slide.notes || ''}</aside>
      </section>`).join('')}
  </div>
  <div class="chrome" aria-label="Presentation controls">
    <button class="nav previous" data-action="previous" aria-label="Previous slide">←</button>
    <button class="nav next" data-action="next" aria-label="Next slide">→</button>
    <button class="timer countdown-timer" data-testid="countdown-timer" data-action="timer" aria-label="Pause or resume countdown timer">6:00</button>
    <span class="counter" aria-live="polite"></span>
    <button class="icon-button" data-action="mute" aria-label="Toggle sound">Sound off</button>
    <button class="icon-button" data-action="help" aria-label="Keyboard help">?</button>
  </div>
  <dialog class="help-dialog">
    <button class="dialog-close" data-action="help">×</button>
    <h2>Controls</h2>
    <p>Next: → ↓ PageDown Space · Previous: ← ↑ PageUp · Home/End · F fullscreen · P notes · M sound</p>
  </dialog>
  <dialog class="notes-dialog">
    <button class="dialog-close" data-action="notes">×</button>
    <p class="notes-position"></p><div class="notes-copy"></div>
  </dialog>`;

const slideEls = [...document.querySelectorAll('.slide')];
const counter = document.querySelector('.counter');
const timerEl = document.querySelector('.timer');

function beep(frequency = 330, duration = 0.045) {
  if (muted) return;
  audioContext ||= new AudioContext();
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(0.035, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + duration);
  oscillator.connect(gain).connect(audioContext.destination);
  oscillator.start(); oscillator.stop(audioContext.currentTime + duration);
}

function showSlide(index, direction = 1) {
  const nextIndex = Math.max(0, Math.min(slides.length - 1, index));
  if (nextIndex === current && slideEls[current].classList.contains('is-active')) return;
  const old = slideEls[current];
  current = nextIndex;
  slideEls.forEach((el, i) => {
    el.classList.toggle('is-active', i === current);
    el.setAttribute('aria-hidden', i === current ? 'false' : 'true');
  });
  if (old && old !== slideEls[current]) gsap.set(old, { opacity: 0, xPercent: direction > 0 ? -3 : 3 });
  gsap.fromTo(slideEls[current], { opacity: 0, xPercent: direction > 0 ? 5 : -5, scale: .985 }, { opacity: 1, xPercent: 0, scale: 1, duration: .48, ease: 'power3.out', clearProps: 'transform' });
  counter.textContent = `${current + 1} / ${slides.length}`;
  history.replaceState(null, '', `#slide-${current + 1}`);
  document.querySelector('.notes-position').textContent = `Slide ${current + 1} of ${slides.length} · ${slides[current].duration}s`;
  document.querySelector('.notes-copy').innerHTML = slides[current].notes || '—';
  if (timerStartedAt === null && current > 0) timerStartedAt = performance.now();
  beep(current === 37 ? 110 : 330 + (current % 5) * 25, current === 37 ? .22 : .045);
}

function navigate(delta) { showSlide(current + delta, delta); }

function toggleTimer() {
  if (timerStartedAt === null) { timerStartedAt = performance.now(); return; }
  if (pausedAt === null) pausedAt = performance.now();
  else { pausedTotal += performance.now() - pausedAt; pausedAt = null; }
}

function updateTimer(now) {
  const elapsed = timerStartedAt === null ? 0 : ((pausedAt ?? now) - timerStartedAt - pausedTotal) / 1000;
  const remaining = Math.max(0, 360 - elapsed);
  const minutes = Math.floor(remaining / 60);
  const seconds = Math.ceil(remaining % 60);
  timerEl.textContent = `${minutes}:${String(seconds === 60 ? 59 : seconds).padStart(2, '0')}`;
  timerEl.classList.toggle('is-warning', remaining <= 60 && remaining > 15);
  timerEl.classList.toggle('is-danger', remaining <= 15);
  requestAnimationFrame(updateTimer);
}

function initInteractions() {
  document.querySelectorAll('[data-draggable]').forEach((node) => Draggable.create(node, { type: 'x,y', bounds: node.closest('.slide-inner'), inertia: false, onPress: () => gsap.to(node, { scale: 1.06, duration: .15 }), onRelease: () => gsap.to(node, { scale: 1, duration: .25, ease: 'back.out(2)' }) }));
  document.addEventListener('pointermove', (event) => {
    const x = event.clientX / innerWidth - .5;
    const y = event.clientY / innerHeight - .5;
    slideEls[current]?.querySelectorAll('[data-depth]').forEach((node) => {
      const depth = Number(node.dataset.depth || 1);
      gsap.to(node, { x: x * depth * 20, y: y * depth * 14, duration: .6, overwrite: true });
    });
  });
}

document.addEventListener('click', (event) => {
  const action = event.target.closest('[data-action]')?.dataset.action;
  if (action === 'next') navigate(1);
  if (action === 'previous') navigate(-1);
  if (action === 'timer') toggleTimer();
  if (action === 'mute') { muted = !muted; event.target.textContent = muted ? 'Sound off' : 'Sound on'; beep(440, .08); }
  if (action === 'help') { const d = document.querySelector('.help-dialog'); d.open ? d.close() : d.showModal(); }
  if (action === 'notes') { const d = document.querySelector('.notes-dialog'); d.open ? d.close() : d.showModal(); }
});

document.addEventListener('keydown', (event) => {
  if (['ArrowRight', 'ArrowDown', 'PageDown', ' '].includes(event.key)) { event.preventDefault(); navigate(1); }
  if (['ArrowLeft', 'ArrowUp', 'PageUp'].includes(event.key)) { event.preventDefault(); navigate(-1); }
  if (event.key === 'Home') showSlide(0, -1);
  if (event.key === 'End') showSlide(slides.length - 1, 1);
  if (event.key.toLowerCase() === 'f') document.documentElement.requestFullscreen?.();
  if (event.key.toLowerCase() === 'p') document.querySelector('[data-action="notes"]').click();
  if (event.key.toLowerCase() === 'm') document.querySelector('[data-action="mute"]').click();
});

let touchX = null;
document.addEventListener('touchstart', (e) => { touchX = e.changedTouches[0].clientX; }, { passive: true });
document.addEventListener('touchend', (e) => { const dx = e.changedTouches[0].clientX - touchX; if (Math.abs(dx) > 50) navigate(dx < 0 ? 1 : -1); }, { passive: true });
window.addEventListener('hashchange', () => showSlide(indexFromHash()));

showSlide(current);
initInteractions();
requestAnimationFrame(updateTimer);

const liveDeckUrl = 'https://soundguyai.github.io/CodexTalkOct26/';
QRCode.toDataURL(liveDeckUrl, { width: 520, margin: 1, color: { dark: '#09090B', light: '#F6F0E4' } }).then((url) => document.querySelectorAll('[data-qr]').forEach((img) => { img.src = url; img.dataset.qrUrl = liveDeckUrl; }));
