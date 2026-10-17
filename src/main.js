import '@fontsource/archivo-black';
import '@fontsource/inter/400.css';
import '@fontsource/inter/600.css';
import { gsap } from 'gsap';
import { Draggable } from 'gsap/Draggable';
import QRCode from 'qrcode';
import { part1Slides } from './slides/part1.js';
import { part2Slides } from './slides/part2.js';
import { wireSlotMachine, spinSlotReels } from './slot-machine.js';
import './styles.css';
import './slides.css';

gsap.registerPlugin(Draggable);

const slides = [...part1Slides, ...part2Slides];
const deck = document.querySelector('#deck');
const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
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
let lastTKeyAt = 0;
let melodyIndex = 0;
let pointerX = 0;
let pointerY = 0;
let parallaxRaf = 0;

/**
 * Never Gonna Give You Up — full chorus (song key / Bb–Db family).
 * One note per slide change; index only moves forward (←/→ both advance).
 * MIDI: Ab4=68 Bb4=70 C5=72 C#5=73 Eb5=75 F5=77 Ab5=80
 */
const RICKROLL_MIDI = [
  // never gonna give you up
  // Ne Bb · ver Bb · gon Ab · na Ab · give F · you F · up Eb
  70, 70, 68, 68, 77, 77, 75,
  // never gonna let you down
  // Ne Bb · ver Bb · gon Ab · na Ab · let Eb · you Eb · down C# · (down) C · (down) Bb
  70, 70, 68, 68, 75, 75, 73, 72, 70,
  // never gonna run around and desert you
  // Ne C# · ver C# · gon C# · na C# · run C# · a- Eb · -round C · (round) Bb · and Ab · de- Ab · -sert Ab · you Eb · (you) C#
  73, 73, 73, 73, 73, 75, 72, 70, 68, 68, 68, 75, 73,
  // never gonna make you cry
  // Ne Bb · ver Bb · gon Ab · na Ab · make F · you F · cry Eb
  70, 70, 68, 68, 77, 77, 75,
  // never gonna say goodbye
  // Ne Bb · ver Bb · gon Ab · na Ab · say Ab5 · good C · -bye C# · (bye) C · (bye) Bb
  70, 70, 68, 68, 80, 72, 73, 72, 70,
  // never gonna tell a lie and hurt you
  // Ne C# · ver C# · gon C# · na C# · tell C# · a Eb · lie C · (lie) Bb · and Ab · hurt Ab · you Eb · (you) C#
  73, 73, 73, 73, 73, 75, 72, 70, 68, 68, 75, 73,
];
const midiToHz = (n) => 440 * (2 ** ((n - 69) / 12));

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
    <p>Next: → ↓ PageDown Space · Previous: ← ↑ PageUp · Home/End · F fullscreen · P notes · M sound · T pause / double-T reset · H hide timer</p>
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
  if (audioContext.state === 'suspended') audioContext.resume();
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  oscillator.type = 'triangle';
  oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(0.04, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + duration);
  oscillator.connect(gain).connect(audioContext.destination);
  oscillator.start();
  oscillator.stop(audioContext.currentTime + duration);
}

function playTransitionTone() {
  // Always forward through the chorus — direction of navigation does not matter.
  const midi = RICKROLL_MIDI[melodyIndex % RICKROLL_MIDI.length];
  melodyIndex = (melodyIndex + 1) % RICKROLL_MIDI.length;
  const hz = midiToHz(midi);
  const isBill = current === 37;
  beep(isBill ? hz * 0.5 : hz, isBill ? 0.16 : 0.07);
}

function pauseInactiveVideos(activeSlide) {
  document.querySelectorAll('video').forEach((video) => {
    if (activeSlide?.contains(video)) return;
    try { video.pause(); } catch { /* ignore */ }
  });
}

function playActiveVideos(slideEl) {
  if (!slideEl) return;
  slideEl.querySelectorAll('video').forEach((video) => {
    video.muted = true;
    video.playsInline = true;
    video.loop = true;
    const tryPlay = () => {
      const result = video.play();
      if (result?.catch) result.catch(() => { /* autoplay may need a gesture */ });
    };
    if (video.readyState >= 2) tryPlay();
    else video.addEventListener('loadeddata', tryPlay, { once: true });
  });
}

function showSlide(index, direction = 1) {
  const nextIndex = Math.max(0, Math.min(slides.length - 1, index));
  if (nextIndex === current && slideEls[current]?.classList.contains('is-active')) return;
  const old = slideEls[current];
  const changed = nextIndex !== current;
  current = nextIndex;
  slideEls.forEach((el, i) => {
    el.classList.toggle('is-active', i === current);
    el.setAttribute('aria-hidden', i === current ? 'false' : 'true');
    // Opacity only — never clearProps transform here (that killed child parallax offsets).
    if (i !== current) gsap.set(el, { opacity: 0 });
  });
  if (!prefersReducedMotion()) {
    if (old && old !== slideEls[current]) gsap.set(old, { opacity: 0, xPercent: direction > 0 ? -3 : 3 });
    // clearProps only xPercent/scale so child [data-depth] x/y parallax survives.
    gsap.fromTo(slideEls[current], { opacity: 0, xPercent: direction > 0 ? 5 : -5, scale: .985 }, { opacity: 1, xPercent: 0, scale: 1, duration: .48, ease: 'power3.out', clearProps: 'xPercent,scale' });
  } else {
    gsap.set(slideEls[current], { opacity: 1, xPercent: 0, scale: 1 });
  }
  counter.textContent = `${current + 1} / ${slides.length}`;
  const nextHash = `#slide-${current + 1}`;
  if (location.hash !== nextHash) history.replaceState(null, '', nextHash);
  document.querySelector('.notes-position').textContent = `Slide ${current + 1} of ${slides.length} · ${slides[current].duration}s`;
  document.querySelector('.notes-copy').innerHTML = slides[current].notes || '—';
  if (timerStartedAt === null && current > 0) timerStartedAt = performance.now();
  if (changed) playTransitionTone();
  pauseInactiveVideos(slideEls[current]);
  playActiveVideos(slideEls[current]);
  try {
    wireSlideInteractions(slideEls[current]);
  } catch (error) {
    console.warn('slide interaction wiring failed', error);
  }
  // Re-apply pointer offsets after slide change so layers are not stuck at 0,0.
  if (!parallaxRaf) parallaxRaf = requestAnimationFrame(applyParallax);
}

function navigate(delta) { showSlide(current + delta, delta); }

function toggleTimer() {
  if (timerStartedAt === null) { timerStartedAt = performance.now(); return; }
  if (pausedAt === null) pausedAt = performance.now();
  else { pausedTotal += performance.now() - pausedAt; pausedAt = null; }
}

function resetTimer() {
  timerStartedAt = performance.now();
  pausedAt = null;
  pausedTotal = 0;
  timerEl.classList.remove('is-hidden');
}

function handleTimerKey() {
  const now = performance.now();
  if (now - lastTKeyAt < 400) {
    resetTimer();
    lastTKeyAt = 0;
    return;
  }
  lastTKeyAt = now;
  toggleTimer();
}

function toggleTimerVisibility() {
  timerEl.classList.toggle('is-hidden');
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

function activeRoot() {
  return slideEls[current]?.querySelector('.slide-inner');
}

function wireKanban(root) {
  const board = root.querySelector('[data-interaction="symphony-kanban"]');
  if (!board || board.dataset.kanbanWired === 'true') return;
  board.dataset.kanbanWired = 'true';
  const columns = [...board.querySelectorAll('[data-kanban-col]')];
  columns.forEach((col) => {
    [...col.querySelectorAll('.kanban-card')].forEach((card) => {
      Draggable.create(card, {
        type: 'x,y',
        bounds: board,
        inertia: false,
        onPress() { gsap.to(card, { scale: 1.05, duration: .12, zIndex: 20 }); },
        onRelease() {
          const rect = card.getBoundingClientRect();
          const cx = rect.left + rect.width / 2;
          const cy = rect.top + rect.height / 2;
          let target = col;
          let best = Infinity;
          columns.forEach((candidate) => {
            const r = candidate.getBoundingClientRect();
            const dist = Math.hypot(cx - (r.left + r.width / 2), cy - (r.top + r.height / 2));
            if (dist < best) { best = dist; target = candidate; }
          });
          target.appendChild(card);
          gsap.set(card, { x: 0, y: 0, scale: 1, zIndex: 1 });
          beep(midiToHz(72), .04);
        },
      });
    });
  });
}

function wireTaskSwipe(root) {
  const stage = root.querySelector('[data-interaction="taskswipe"]');
  if (!stage || stage.dataset.swipeWired === 'true') return;
  stage.dataset.swipeWired = 'true';
  const stack = stage.querySelector('.taskswipe-stack');
  if (!stack) return;

  const status = stage.querySelector('[data-swipe-status]');
  const cards = () => [...stack.querySelectorAll('.taskswipe-card:not(.is-gone)')];

  const fly = (card, dir) => {
    const label = dir < 0 ? 'keep' : 'postpone';
    if (status) status.textContent = label;
    stage.classList.toggle('is-keep', dir < 0);
    stage.classList.toggle('is-postpone', dir > 0);
    gsap.to(card, {
      x: dir * 520,
      rotate: dir * 18,
      opacity: 0,
      duration: prefersReducedMotion() ? 0.05 : 0.28,
      ease: 'power2.in',
      onComplete() {
        card.classList.add('is-gone');
        card.remove();
        stage.classList.remove('is-keep', 'is-postpone');
        const remaining = cards();
        remaining.forEach((node, i) => {
          node.classList.toggle('is-top', i === 0);
          node.classList.toggle('is-behind', i > 0);
          gsap.set(node, { zIndex: remaining.length - i });
        });
        if (!remaining.length && status) status.textContent = 'inbox clear';
      },
    });
    beep(dir < 0 ? midiToHz(64) : midiToHz(58), .05);
  };

  const bindTop = () => {
    const top = cards()[0];
    if (!top || top.dataset.bound === 'true') return;
    top.dataset.bound = 'true';
    top.classList.add('is-top');
    Draggable.create(top, {
      type: 'x,y',
      bounds: stage,
      inertia: false,
      onDrag() {
        const x = this.x;
        top.style.setProperty('--tilt', `${x / 18}deg`);
        stage.classList.toggle('is-keep', x < -40);
        stage.classList.toggle('is-postpone', x > 40);
      },
      onRelease() {
        if (this.x <= -110) fly(top, -1);
        else if (this.x >= 110) fly(top, 1);
        else {
          gsap.to(top, { x: 0, y: 0, duration: .25, ease: 'back.out(1.6)' });
          top.style.setProperty('--tilt', '0deg');
          stage.classList.remove('is-keep', 'is-postpone');
        }
      },
    });
  };

  stage.querySelector('[data-swipe="keep"]')?.addEventListener('click', () => {
    const top = cards()[0];
    if (top) fly(top, -1);
  });
  stage.querySelector('[data-swipe="postpone"]')?.addEventListener('click', () => {
    const top = cards()[0];
    if (top) fly(top, 1);
  });

  const observer = new MutationObserver(bindTop);
  observer.observe(stack, { childList: true });
  cards().forEach((node, i) => {
    node.classList.toggle('is-top', i === 0);
    node.classList.toggle('is-behind', i > 0);
    gsap.set(node, { zIndex: cards().length - i });
  });
  bindTop();
}

function wireTypeShift(root) {
  const words = root.querySelectorAll('[data-strike-word]');
  if (!words.length || root.dataset.strikeWired === 'true') return;
  root.dataset.strikeWired = 'true';
  words.forEach((word) => {
    word.addEventListener('click', () => {
      word.classList.toggle('is-struck');
      beep(midiToHz(word.classList.contains('is-struck') ? 55 : 67), .04);
    });
  });
}

function wireRepoPreview(root) {
  const tree = root.querySelector('.repo-tree');
  const preview = root.querySelector('[data-repo-preview]');
  if (!tree || !preview || tree.dataset.previewWired === 'true') return;
  tree.dataset.previewWired = 'true';
  const snippets = {
    Talks: '# talks/\n\n- Codex meetup deck\n- United XR notes\n- Next: polish slides',
    Projects: '# projects/\n\n- LoveLink\n- Save Point\n- Improv Dashboard\n- TaskSwipe',
    Games: '# games/\n\n- Oh SHIP!\n- Bolt Riley\n- Meditation EXTREME\n- Where Are My Glasses?',
    Submissions: '# submissions/\n\n- funds\n- accelerators\n- festival workshops',
    'Life tools': '# life-tools/\n\n- currency\n- car appraiser\n- show tracker\n- calendar',
  };
  tree.querySelectorAll('button[data-branch]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.branch;
      preview.textContent = snippets[key] || snippets.Projects;
      tree.querySelectorAll('button').forEach((b) => b.classList.remove('is-active'));
      btn.classList.add('is-active');
    });
  });
}

/**
 * Leader lines for the 2026 chart. Arrowheads stay on fixed fractions of the
 * smash bar; bubble drag only moves the other end.
 */
function layoutChartCallouts(root) {
  const chart = root?.querySelector?.('.yearly-chart--agents');
  if (!chart) return;
  const bar = chart.querySelector('.year-bar.is-smash');
  const svg = chart.querySelector('.chart-leaders');
  if (!bar || !svg) return;
  const chartRect = chart.getBoundingClientRect();
  if (chartRect.width < 2 || chartRect.height < 2) return;
  const barRect = bar.getBoundingClientRect();
  const scaleX = chartRect.width / (chart.offsetWidth || chartRect.width) || 1;
  const scaleY = chartRect.height / (chart.offsetHeight || chartRect.height) || 1;
  svg.setAttribute('viewBox', `0 0 ${chart.offsetWidth} ${chart.offsetHeight}`);
  const toLocal = (vx, vy) => ({
    x: (vx - chartRect.left) / scaleX,
    y: (vy - chartRect.top) / scaleY,
  });
  chart.querySelectorAll('.chart-callout').forEach((node) => {
    const line = svg.querySelector(`line[data-leader="${node.dataset.leader}"]`);
    if (!line) return;
    const anchorT = Number(node.dataset.anchor || 0.5);
    const anchor = toLocal(barRect.left + 6 * scaleX, barRect.top + barRect.height * anchorT);
    const bubble = node.getBoundingClientRect();
    const center = toLocal(bubble.left + bubble.width / 2, bubble.top + bubble.height / 2);
    const dx = anchor.x - center.x;
    const dy = anchor.y - center.y;
    const halfW = (bubble.width / scaleX) / 2;
    const halfH = (bubble.height / scaleY) / 2;
    const denom = Math.max(Math.abs(dx) / Math.max(halfW, 1), Math.abs(dy) / Math.max(halfH, 1), 0.001);
    line.setAttribute('x1', (center.x + dx / denom).toFixed(1));
    line.setAttribute('y1', (center.y + dy / denom).toFixed(1));
    line.setAttribute('x2', anchor.x.toFixed(1));
    line.setAttribute('y2', anchor.y.toFixed(1));
  });
  svg.classList.add('is-ready');
}

function wireChartCallouts(root) {
  if (!root || root.dataset.calloutsWired === 'true') return;
  const chart = root.querySelector('.yearly-chart--agents');
  if (!chart) return;
  root.dataset.calloutsWired = 'true';
  chart.querySelectorAll('.chart-callout').forEach((node) => {
    Draggable.create(node, {
      type: 'x,y',
      bounds: chart,
      inertia: false,
      onPress() { node.classList.add('is-lifted'); },
      onDrag() { layoutChartCallouts(root); },
      onRelease() {
        node.classList.remove('is-lifted');
        layoutChartCallouts(root);
      },
    });
  });
  chart.querySelectorAll('.chart-callout img').forEach((img) => {
    img.addEventListener('load', () => layoutChartCallouts(root));
  });
}

/** Static mid-Oct 2026 mock. BOI 16 Oct 2026: 100 JPY = ₪1.9557, 1 USD = ₪3.089. */
const JPY_TO_USD = 0.00633;
const JPY_TO_ILS = 0.019557;

function formatMockMoney(amount, symbol) {
  if (!Number.isFinite(amount)) return '—';
  const body = Math.abs(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `${amount < 0 ? '−' : ''}${symbol}${body}`;
}

function wireCurrencyMock(root) {
  const mock = root?.querySelector?.('[data-interaction="currency-mock"]');
  if (!mock || mock.dataset.wired === 'true') return;
  mock.dataset.wired = 'true';
  const input = mock.querySelector('input[name="jpy"]');
  const usd = mock.querySelector('[data-out="usd"]');
  const ils = mock.querySelector('[data-out="ils"]');
  const render = () => {
    const raw = String(input.value || '').replace(/,/g, '').trim();
    const jpy = raw === '' ? NaN : Number(raw);
    usd.textContent = formatMockMoney(jpy * JPY_TO_USD, '$');
    ils.textContent = formatMockMoney(jpy * JPY_TO_ILS, '');
  };
  mock.querySelector('form')?.addEventListener('submit', (event) => event.preventDefault());
  input.addEventListener('input', render);
  render();
}

function wireCarMap(root) {
  const map = root?.querySelector?.('[data-interaction="car-map"]');
  if (!map || map.dataset.wired === 'true') return;
  map.dataset.wired = 'true';
  const copy = map.querySelector('[data-drive-copy]');
  const time = map.querySelector('[data-drive-time]');
  map.querySelectorAll('.appraiser-pin').forEach((pin) => {
    pin.addEventListener('click', () => {
      map.querySelectorAll('.appraiser-pin').forEach((other) => other.classList.remove('is-active'));
      pin.classList.add('is-active');
      copy.textContent = pin.dataset.place;
      time.textContent = `${pin.dataset.minutes} min`;
    });
  });
}

function wireShowTracker(root) {
  const board = root?.querySelector?.('[data-interaction="show-tracker"]');
  if (!board || board.dataset.wired === 'true') return;
  board.dataset.wired = 'true';
  let dragEl = null;
  let suppressClick = false;
  const toggleSeen = (card) => {
    card.classList.toggle('is-seen');
    card.setAttribute('aria-pressed', card.classList.contains('is-seen') ? 'true' : 'false');
  };
  board.addEventListener('click', (event) => {
    const card = event.target.closest('.show-card');
    if (!card || suppressClick) return;
    toggleSeen(card);
  });
  board.addEventListener('keydown', (event) => {
    const card = event.target.closest?.('.show-card');
    if (!card || (event.key !== 'Enter' && event.key !== ' ')) return;
    event.preventDefault();
    event.stopPropagation();
    toggleSeen(card);
  });
  board.addEventListener('dragstart', (event) => {
    const card = event.target.closest('.show-card');
    if (!card) return;
    dragEl = card;
    suppressClick = true;
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', card.dataset.show || 'show');
    card.classList.add('is-dragging');
  });
  board.addEventListener('dragend', () => {
    dragEl?.classList.remove('is-dragging');
    board.querySelectorAll('.show-list').forEach((list) => list.classList.remove('is-drop'));
    const dragged = dragEl;
    dragEl = null;
    setTimeout(() => {
      suppressClick = false;
      dragged?.classList.remove('is-dragging');
    }, 80);
  });
  board.querySelectorAll('.show-list').forEach((list) => {
    list.addEventListener('dragover', (event) => {
      event.preventDefault();
      list.classList.add('is-drop');
    });
    list.addEventListener('dragleave', (event) => {
      if (!list.contains(event.relatedTarget)) list.classList.remove('is-drop');
    });
    list.addEventListener('drop', (event) => {
      event.preventDefault();
      list.classList.remove('is-drop');
      const stack = list.querySelector('.show-list__stack');
      if (dragEl && stack && dragEl.parentElement !== stack) stack.appendChild(dragEl);
    });
  });
}

const focusLoops = new WeakMap();
const FOCUS_POOL_MAX = 2;
const FOCUS_SOLO_PER_SEC = 0.1;
const FOCUS_CRAWL = 0.08;

function focusCharge(card) {
  const value = Number(card.dataset.charge || 0);
  return Number.isFinite(value) ? value : 0;
}

function paintFocus(field) {
  const pool = Number(field.dataset.focusPool ?? FOCUS_POOL_MAX);
  const pct = Math.max(0, Math.min(100, (pool / FOCUS_POOL_MAX) * 100));
  const meter = field.querySelector('[data-focus-pool]');
  if (!meter) return;
  meter.style.setProperty('--pool', `${pct.toFixed(2)}%`);
  meter.setAttribute('aria-valuenow', String(Math.round(pct)));
  meter.classList.toggle('is-empty', pool <= 0.0008);
  const readout = meter.querySelector('[data-focus-readout]');
  if (readout) readout.textContent = pool <= 0.0008 ? 'spent' : `${Math.round(pct)}%`;
}

function tickFocus(field, dt) {
  let pool = Number(field.dataset.focusPool ?? FOCUS_POOL_MAX);
  if (!Number.isFinite(pool)) pool = FOCUS_POOL_MAX;
  const cards = [...field.querySelectorAll('[data-energy-card]')];
  const active = cards.filter((card) => card.classList.contains('is-charging') && focusCharge(card) < 0.999);
  if (active.length) {
    const crawling = pool <= 0.0008;
    const budget = crawling
      ? FOCUS_SOLO_PER_SEC * FOCUS_CRAWL * dt
      : Math.min(pool, FOCUS_SOLO_PER_SEC * dt);
    const share = budget / active.length;
    let spent = 0;
    active.forEach((card) => {
      const before = focusCharge(card);
      const next = Math.min(1, before + share);
      spent += next - before;
      card.dataset.charge = next.toFixed(4);
      card.style.setProperty('--charge', `${(next * 100).toFixed(2)}%`);
      const full = next >= 0.999;
      card.classList.toggle('is-full', full);
      const label = card.querySelector('.attention-status');
      if (label) label.textContent = full ? 'full' : (crawling ? `${Math.round(next * 100)}% · crawl` : `${Math.round(next * 100)}%`);
    });
    if (!crawling) pool = Math.max(0, pool - spent);
    field.dataset.focusPool = String(pool);
  }
  paintFocus(field);
}

function startFocusLoop(field) {
  if (focusLoops.get(field)) return;
  let last = performance.now();
  const step = (now) => {
    if (!field.closest('.slide')?.classList.contains('is-active')) {
      focusLoops.delete(field);
      return;
    }
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    tickFocus(field, dt);
    focusLoops.set(field, requestAnimationFrame(step));
  };
  focusLoops.set(field, requestAnimationFrame(step));
}

function wireFocusEnergy(root) {
  const field = root.querySelector('[data-interaction="focus-energy"]');
  if (!field) return;
  if (field.dataset.energyWired !== 'true') {
    field.dataset.energyWired = 'true';
    field.dataset.focusPool = String(FOCUS_POOL_MAX);
    field.querySelectorAll('[data-energy-card]').forEach((card) => {
      card.dataset.charge = '0';
      card.style.setProperty('--charge', '0%');
    });
    paintFocus(field);
    field.addEventListener('click', (event) => {
      const card = event.target.closest('[data-energy-card]');
      if (!card) return;
      const on = card.classList.toggle('is-charging');
      card.setAttribute('aria-pressed', on ? 'true' : 'false');
      if (!on) {
        const pct = Math.round(focusCharge(card) * 100);
        const label = card.querySelector('.attention-status');
        if (label) label.textContent = card.classList.contains('is-full') ? 'full' : (pct ? `${pct}%` : 'idle');
      }
      beep(midiToHz(on ? 74 : 62), 0.03);
    });
  }
  startFocusLoop(field);
}

function wireTheCut(root) {
  const board = root.querySelector('[data-interaction="the-cut"]');
  if (!board || board.dataset.cutWired === 'true') return;
  board.dataset.cutWired = 'true';
  const above = board.querySelector('[data-cut-zone="above"]');
  const below = board.querySelector('[data-cut-zone="below"]');
  const line = board.querySelector('.the-cut__line');
  const countEl = board.querySelector('[data-cut-count]');
  const cap = 7;
  if (!above || !below || !line) return;

  const namesIn = (zone) => [...zone.querySelectorAll('.cut-name')];
  const updateCount = () => {
    const count = namesIn(above).length;
    board.dataset.aboveCount = String(count);
    if (countEl) countEl.textContent = `${count} this week`;
  };
  const clearEject = () => board.querySelectorAll('.is-eject').forEach((node) => node.classList.remove('is-eject'));
  const zoneAt = (clientY) => {
    const rect = line.getBoundingClientRect();
    return clientY < rect.top + rect.height / 2 ? 'above' : 'below';
  };
  const settle = (node, fromRect) => {
    node.classList.remove('is-dragging', 'is-promoted');
    node.style.zIndex = '';
    node.style.transform = '';
    node.style.transition = '';
    if (prefersReducedMotion()) return;
    const to = node.getBoundingClientRect();
    const dx = fromRect.left - to.left;
    const dy = fromRect.top - to.top;
    if (Math.hypot(dx, dy) < 2) return;
    node.style.transform = `translate(${dx}px, ${dy}px)`;
    requestAnimationFrame(() => {
      node.style.transition = 'transform .32s cubic-bezier(.2,.75,.2,1)';
      node.style.transform = 'translate(0px, 0px)';
      const clear = (event) => {
        if (event.propertyName !== 'transform') return;
        node.style.transition = '';
        node.style.transform = '';
        node.removeEventListener('transitionend', clear);
      };
      node.addEventListener('transitionend', clear);
    });
  };

  let drag = null;
  updateCount();

  board.addEventListener('pointerdown', (event) => {
    const name = event.target.closest('.cut-name');
    if (!name || event.button > 0) return;
    event.preventDefault();
    drag = {
      name,
      id: event.pointerId,
      origin: above.contains(name) ? 'above' : 'below',
      startX: event.clientX,
      startY: event.clientY,
    };
    name.classList.add('is-dragging');
    name.setPointerCapture?.(event.pointerId);
    suppressSwipe = true;
  });

  window.addEventListener('pointermove', (event) => {
    if (!drag || event.pointerId !== drag.id) return;
    const x = event.clientX - drag.startX;
    const y = event.clientY - drag.startY;
    const zone = zoneAt(event.clientY);
    const scale = zone === 'above' && drag.origin === 'below' ? 2.8 : 1;
    drag.name.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
    drag.name.classList.toggle('is-promoted', scale > 1);
    clearEject();
    line.classList.toggle('is-hot', zone !== drag.origin);
    if (zone === 'above' && drag.origin === 'below' && namesIn(above).length >= cap) {
      namesIn(above).at(-1)?.classList.add('is-eject');
    }
  });

  const finish = (event) => {
    if (!drag || (event && event.pointerId !== drag.id)) return;
    const { name, origin, startX, startY } = drag;
    const moved = Math.hypot(event.clientX - startX, event.clientY - startY) > 8;
    const zone = zoneAt(event.clientY);
    const from = name.getBoundingClientRect();
    drag = null;
    clearEject();
    line.classList.remove('is-hot');
    window.setTimeout(() => { suppressSwipe = false; }, 120);
    if (!moved || zone === origin) {
      settle(name, from);
      return;
    }
    let victim = null;
    let victimFrom = null;
    if (zone === 'above') {
      const current = namesIn(above);
      if (current.length >= cap) {
        victim = current[current.length - 1];
        victimFrom = victim.getBoundingClientRect();
      }
      above.appendChild(name);
      if (victim) below.insertBefore(victim, below.firstChild);
    } else {
      below.insertBefore(name, below.firstChild);
    }
    settle(name, from);
    if (victim && victimFrom) settle(victim, victimFrom);
    updateCount();
    beep(midiToHz(zone === 'above' ? 76 : 64), 0.04);
  };

  window.addEventListener('pointerup', finish);
  window.addEventListener('pointercancel', finish);
}

function wireSlideInteractions(slideEl) {
  if (!slideEl) return;
  const root = slideEl.querySelector('.slide-inner');
  if (!root) return;

  if (root.dataset.wired !== 'true') {
    root.dataset.wired = 'true';

    const swimlanes = root.querySelector('.swimlanes');
    if (swimlanes) {
      [...swimlanes.querySelectorAll('.swimlane')].forEach((lane) => {
        Draggable.create(lane, {
          type: 'y',
          bounds: swimlanes,
          inertia: false,
          onDragEnd() {
            const ordered = [...swimlanes.querySelectorAll('.swimlane')]
              .sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top);
            ordered.forEach((node) => swimlanes.appendChild(node));
            gsap.set(ordered, { x: 0, y: 0 });
          },
        });
      });
    }

    const handoffPaper = root.querySelector('.handoff-paper');
    if (handoffPaper && !prefersReducedMotion()) {
      gsap.fromTo(handoffPaper, { x: -40, opacity: .55 }, { x: 40, opacity: 1, duration: 1.6, ease: 'power1.inOut', yoyo: true, repeat: -1 });
    }

    root.querySelectorAll('[data-draggable="true"]').forEach((node) => {
      if (node.closest('[data-interaction="symphony-kanban"], [data-interaction="taskswipe"]')) return;
      if (node.classList.contains('chart-callout')) return;
      Draggable.create(node, {
        type: 'x,y',
        bounds: root,
        inertia: false,
        onPress() {
          gsap.to(node, { scale: 1.06, duration: .15, zIndex: 30 });
        },
        onRelease() {
          gsap.to(node, { scale: 1, duration: .25, ease: 'back.out(2)' });
        },

      });
    });
  }

  wireChartCallouts(root);
  layoutChartCallouts(root);
  requestAnimationFrame(() => layoutChartCallouts(root));
  window.setTimeout(() => layoutChartCallouts(root), 520);
  wireCurrencyMock(root);
  wireCarMap(root);
  wireShowTracker(root);
  wireKanban(root);
  wireTaskSwipe(root);
  wireTypeShift(root);
  wireRepoPreview(root);
  wireSlotMachine(root, { gsap, reducedMotion: prefersReducedMotion() });
  wireTheCut(root);
  wireFocusEnergy(root);
}

function runAction(action, trigger) {
  const root = activeRoot();
  if (!root || !action) return;
  const reduced = prefersReducedMotion();

  if (action === 'tilt') {
    const grid = root.querySelector('.project-grid, .hero-grid');
    if (grid) gsap.fromTo(grid, { rotateX: 0, rotateY: 0 }, { rotateX: reduced ? 0 : 8, rotateY: reduced ? 0 : -12, duration: .45, yoyo: true, repeat: 1, transformPerspective: 800 });
  }
  if (action === 'pause-orbit') {
    root.querySelector('.about-orbit')?.classList.toggle('is-paused');
  }
  if (action === 'pull-tiles') {
    const mosaic = root.querySelector('.tiny-mosaic');
    if (mosaic) gsap.fromTo(mosaic.children, { y: 0, scale: 1 }, { y: reduced ? 0 : -28, scale: reduced ? 1 : 1.15, stagger: .05, duration: .35, yoyo: true, repeat: 1 });
  }
  if (action === 'rack-focus') {
    const image = root.querySelector('.project-image');
    if (image) {
      image.classList.toggle('is-racked');
      gsap.to(image, { filter: image.classList.contains('is-racked') ? 'blur(0px) saturate(1.2)' : 'blur(2px) saturate(.7)', duration: reduced ? 0 : .35 });
    }
  }
  if (action === 'toggle-chaos') {
    const section = root.querySelector('[data-interaction="shake-reduced-motion"]');
    section?.classList.toggle('is-chaos');
    if (section?.classList.contains('is-chaos') && !reduced) {
      gsap.fromTo(section, { x: 0 }, { x: 6, duration: .05, yoyo: true, repeat: 11 });
    }
  }
  if (action === 'swap-tiles') {
    const image = root.querySelector('.project-image img, .project-image');
    if (image) gsap.fromTo(image, { rotate: 0 }, { rotate: reduced ? 0 : 180, duration: .5, ease: 'back.out(1.4)' });
  }
  if (action === 'reveal-port') {
    trigger?.classList.toggle('is-revealed');
  }
  if (action === 'spin-prompt') {
    gsap.fromTo(trigger, { rotate: 0 }, { rotate: 360, duration: reduced ? 0 : .6, ease: 'power2.out' });
  }
  if (action === 'expand-events') {
    gsap.fromTo(trigger, { scale: 1 }, { scale: 1.2, duration: .25, yoyo: true, repeat: 1 });
  }
  if (action === 'ball-arc') {
    gsap.fromTo(trigger, { y: 0 }, { y: reduced ? 0 : -80, duration: .35, yoyo: true, repeat: 1, ease: 'power2.out' });
  }
  if (action === 'stamp-pass') {
    gsap.fromTo(trigger, { scale: .6, rotate: -20, opacity: 0 }, { scale: 1, rotate: -7, opacity: 1, duration: .35, ease: 'back.out(2)' });
  }
  if (action === 'pull-slot') {
    spinSlotReels(root, { gsap, reducedMotion: reduced });
  }
  if (action === 'reorder-lanes') {
    const lanes = root.querySelector('.swimlanes');
    if (lanes) {
      const kids = [...lanes.children];
      kids.sort(() => Math.random() - .5).forEach((node) => lanes.appendChild(node));
      gsap.from(kids, { x: reduced ? 0 : 24, opacity: .4, stagger: .03, duration: .3 });
    }
  }
  if (action === 'multiply-windows') {
    const windows = root.querySelector('.tiny-windows');
    if (windows) gsap.fromTo(windows.children, { scale: .7, opacity: .4 }, { scale: 1, opacity: 1, stagger: .08, duration: .35, ease: 'back.out(1.8)' });
    playActiveVideos(slideEls[current]);
  }
}

function parallaxSkipped(node) {
  if (!node || node.classList.contains('is-gone')) return true;
  // Final/QR slide: left copy must stay put so it never translates off-canvas.
  if (node.matches('.final-copy') || node.closest('.final-copy')) return true;
  if (node.matches('[data-draggable], .kanban-card, .taskswipe-card, .swimlane, .year-bar, .chart-callout, .year-project-pin, .slot-reel__strip, .slot-tile, .slot-lever')) return true;
  if (node.closest('[data-draggable], .kanban-card, .taskswipe-card, .chart-callout, .slot-reel')) return true;
  return false;
}

/**
 * Pointer parallax for [data-depth] layers.
 * Uses CSS --parallax-x/y + the independent `translate` property (see styles.css)
 * so it composes with CSS `transform` (about-copy centering, hover scale) and is
 * not wiped by slide-transition clearProps / GSAP xPercent on the parent .slide.
 * Matches the original d01d8c5/dee20f5 feel (smooth follow, always on — not gated
 * by prefers-reduced-motion, which was blocking the talk deck on some Windows setups).
 */
function applyParallax() {
  parallaxRaf = 0;
  const root = slideEls[current];
  if (!root) return;
  const x = pointerX;
  const y = pointerY;
  document.documentElement.style.setProperty('--pointer-x', x.toFixed(4));
  document.documentElement.style.setProperty('--pointer-y', y.toFixed(4));
  // Final/QR slide: further soften decorative layers; left copy is skipped above.
  const finalSlide = root.classList.contains('slide--final') || root.classList.contains('slide--qr-close');
  const depthScale = finalSlide ? 0.5 : 1;
  root.querySelectorAll('[data-depth]').forEach((node) => {
    if (parallaxSkipped(node)) {
      node.style.setProperty('--parallax-x', '0px');
      node.style.setProperty('--parallax-y', '0px');
      return;
    }
    const depth = Number(node.dataset.depth || 1) * depthScale;
    const px = x * depth * 14;
    const py = y * depth * 10;
    node.style.setProperty('--parallax-x', `${px.toFixed(2)}px`);
    node.style.setProperty('--parallax-y', `${py.toFixed(2)}px`);
  });
  const agents = root.querySelectorAll('.agent-window, .era-pane');
  if (agents.length) {
    agents.forEach((windowEl) => {
      const rect = windowEl.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dist = Math.hypot((pointerX + .5) * innerWidth - cx, (pointerY + .5) * innerHeight - cy);
      const dominance = Math.max(0.4, 1.2 - dist / 650);
      gsap.to(windowEl, {
        filter: `brightness(${dominance}) saturate(${0.75 + dominance * 0.4})`,
        scale: 0.94 + dominance * 0.08,
        zIndex: Math.round(dominance * 10),
        duration: .25,
        overwrite: 'auto',
      });
    });
  }
}

function initInteractions() {
  // Always listen — pointer parallax is intentional presenter feedback (original behavior).
  document.addEventListener('pointermove', (event) => {
    pointerX = event.clientX / innerWidth - .5;
    pointerY = event.clientY / innerHeight - .5;
    if (!parallaxRaf) parallaxRaf = requestAnimationFrame(applyParallax);
  }, { passive: true });
  // Also catch mouseenter-from-outside so first move after focus still updates.
  document.addEventListener('mousemove', (event) => {
    pointerX = event.clientX / innerWidth - .5;
    pointerY = event.clientY / innerHeight - .5;
    if (!parallaxRaf) parallaxRaf = requestAnimationFrame(applyParallax);
  }, { passive: true });

  document.documentElement.classList.toggle('reduced-motion', prefersReducedMotion());
  window.addEventListener('resize', () => {
    layoutChartCallouts(slideEls[current]?.querySelector('.slide-inner'));
  });
}

document.addEventListener('click', (event) => {
  const actionButton = event.target.closest('[data-action]');
  const action = actionButton?.dataset.action;
  if (action === 'next') navigate(1);
  else if (action === 'previous') navigate(-1);
  else if (action === 'timer') toggleTimer();
  else if (action === 'mute') {
    muted = !muted;
    actionButton.textContent = muted ? 'Sound off' : 'Sound on';
    if (!muted) {
      audioContext ||= new AudioContext();
      audioContext.resume();
      beep(midiToHz(RICKROLL_MIDI[melodyIndex % RICKROLL_MIDI.length]), .08);
    }
  }
  else if (action === 'help') { const d = document.querySelector('.help-dialog'); d.open ? d.close() : d.showModal(); }
  else if (action === 'notes') { const d = document.querySelector('.notes-dialog'); d.open ? d.close() : d.showModal(); }
  else if (action) runAction(action, actionButton);
});

document.addEventListener('keydown', (event) => {
  if (event.defaultPrevented) return;
  if (event.target?.closest?.('input, textarea, [contenteditable="true"]')) return;
  const inDialog = event.target?.closest?.('dialog');
  if (['ArrowRight', 'ArrowDown', 'PageDown', ' '].includes(event.key)) {
    if (inDialog) return;
    event.preventDefault();
    navigate(1);
    return;
  }
  if (['ArrowLeft', 'ArrowUp', 'PageUp'].includes(event.key)) {
    if (inDialog) return;
    event.preventDefault();
    navigate(-1);
    return;
  }
  if (event.key === 'Home') { event.preventDefault(); showSlide(0, -1); }
  if (event.key === 'End') { event.preventDefault(); showSlide(slides.length - 1, 1); }
  if (event.key.toLowerCase() === 'f') document.documentElement.requestFullscreen?.();
  if (event.key.toLowerCase() === 'p') document.querySelector('[data-action="notes"]').click();
  if (event.key.toLowerCase() === 'm') document.querySelector('[data-action="mute"]').click();
  if (event.key.toLowerCase() === 't') { event.preventDefault(); handleTimerKey(); }
  if (event.key.toLowerCase() === 'h') { event.preventDefault(); toggleTimerVisibility(); }
});

let touchX = null;
let suppressSwipe = false;
document.addEventListener('touchstart', (e) => {
  touchX = e.changedTouches[0].clientX;
  if (e.target.closest?.('.the-cut, [data-energy-card]')) suppressSwipe = true;
}, { passive: true });
document.addEventListener('touchend', (e) => {
  const blocked = suppressSwipe || e.target.closest?.('.chart-callout, .show-card, .appraiser-pin, .fx-panel, .the-cut, [data-energy-card]');
  const dx = e.changedTouches[0].clientX - touchX;
  if (!blocked && Math.abs(dx) > 50) navigate(dx < 0 ? 1 : -1);
  suppressSwipe = false;
}, { passive: true });
window.addEventListener('hashchange', () => showSlide(indexFromHash()));

showSlide(current);
initInteractions();
requestAnimationFrame(updateTimer);

const liveDeckUrl = 'https://soundguyai.github.io/CodexTalkOct26/';
QRCode.toDataURL(liveDeckUrl, { width: 520, margin: 1, color: { dark: '#09090B', light: '#F6F0E4' } }).then((url) => document.querySelectorAll('[data-qr]').forEach((img) => { img.src = url; img.dataset.qrUrl = liveDeckUrl; }));
