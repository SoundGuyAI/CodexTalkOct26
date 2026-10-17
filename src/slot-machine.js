/**
 * Slot-machine reels for part1-28 (Hackathons. Funds. Talks.).
 * Kept separate so pull/spin logic does not fight parallax/rickroll edits in main.js.
 *
 * Spin model: each reel scrolls a continuous symbol strip (translateY) at its own
 * speed, then ease-out lands on a symbol with classic left→right stagger.
 */

function sizeReelTiles(machine) {
  if (!machine) return;
  machine.querySelectorAll('.slot-reel').forEach((reel) => {
    const h = Math.max(1, Math.round(reel.getBoundingClientRect().height));
    reel.style.setProperty('--slot-tile-h', `${h}px`);
    reel.querySelectorAll('.slot-tile').forEach((tile) => {
      tile.style.height = `${h}px`;
      tile.style.minHeight = `${h}px`;
      tile.style.flex = `0 0 ${h}px`;
    });
  });
}

function reelMetrics(reel) {
  const strip = reel.querySelector('.slot-reel__strip');
  if (!strip) return null;
  const symbols = Number(reel.dataset.symbols || Math.floor(strip.children.length / 2)) || 1;
  const h = Math.max(1, Math.round(reel.getBoundingClientRect().height));
  return { strip, symbols, h, cycle: symbols * h };
}

/** Positive modulo for wrapping strip position into one symbol cycle. */
function wrapY(y, cycle) {
  if (cycle <= 0) return 0;
  const mod = ((-y) % cycle + cycle) % cycle;
  return -mod;
}

function currentIndex(y, h, symbols) {
  if (h <= 0 || symbols <= 0) return 0;
  const idx = Math.round(-y / h);
  return ((idx % symbols) + symbols) % symbols;
}

/** Next absolute tile index (>= pos + minTravel) that shows `land`. */
function landingEndPos(pos, land, symbols, minTravel) {
  let endPos = Math.ceil(pos + minTravel);
  while (((endPos % symbols) + symbols) % symbols !== land) {
    endPos += 1;
  }
  return endPos;
}

/**
 * Spin all three reel strips. Safe to call on slide enter and on lever pull.
 *
 * Always animates. `prefers-reduced-motion: reduce` is common on this Windows
 * talk machine (animation effects off). Honoring it used to `gsap.set` each
 * strip straight to the landing tile, so Pull looked like an instant image swap
 * even though the translateY timeline existed. Parallax is already ungated for
 * the same reason. Callers may still pass reducedMotion; it is ignored.
 */
export function spinSlotReels(root, { gsap } = {}) {
  if (!root || !gsap) return;
  const machine = root.querySelector('.slot-machine');
  if (!machine) return;
  if (machine.dataset.slotSpinning === 'true') return;

  sizeReelTiles(machine);

  const lever = machine.querySelector('.slot-lever');
  const reels = [...machine.querySelectorAll('.slot-reel')];
  if (!reels.length) return;

  machine.dataset.slotSpinning = 'true';
  lever?.classList.add('is-busy');

  if (lever) {
    gsap.fromTo(
      lever,
      { rotate: 0 },
      {
        rotate: 36,
        duration: 0.22,
        yoyo: true,
        repeat: 1,
        transformOrigin: '50% 8%',
        ease: 'power2.inOut',
      },
    );
  }

  let pending = reels.length;

  const done = () => {
    pending -= 1;
    if (pending <= 0) {
      machine.dataset.slotSpinning = 'false';
      lever?.classList.remove('is-busy');
    }
  };

  reels.forEach((reel, i) => {
    const metrics = reelMetrics(reel);
    if (!metrics) {
      done();
      return;
    }
    const { strip, symbols, h, cycle } = metrics;

    gsap.killTweensOf(strip);
    if (strip._slotProxy) gsap.killTweensOf(strip._slotProxy);

    const startIndex = currentIndex(Number(gsap.getProperty(strip, 'y')) || 0, h, symbols);
    const startY = -startIndex * h;
    gsap.set(strip, { y: startY });

    const land = Math.floor(Math.random() * symbols);

    // Per-reel personality: different speeds + staggered stop windows.
    const tilesPerSec = 22 + i * 7; // reel 0 slowest, reel 2 fastest
    const spinSeconds = 1.05 + i * 0.42; // constant-speed phase length (stagger)
    const stopSeconds = 0.85 + i * 0.12; // ease-out length after that
    const coastTiles = symbols * (2 + i) + 3; // travel during decelerate

    const spinDistance = tilesPerSec * h * spinSeconds;
    const yAfterSpin = startY - spinDistance;
    const endPos = landingEndPos(-yAfterSpin / h, land, symbols, coastTiles);
    const targetY = -endPos * h;

    const proxy = { y: startY };
    strip._slotProxy = proxy;

    const applyWrapped = () => {
      gsap.set(strip, { y: wrapY(proxy.y, cycle) });
    };

    reel.classList.add('is-spinning');
    reel.classList.remove('is-stopping');

    const tl = gsap.timeline({
      onComplete() {
        gsap.set(strip, { y: -land * h });
        proxy.y = -land * h;
        reel.classList.remove('is-spinning', 'is-stopping');
        strip._slotProxy = null;
        done();
      },
    });

    // Phase 1 — constant-velocity strip scroll (motion blur via CSS).
    tl.to(proxy, {
      y: yAfterSpin,
      duration: spinSeconds,
      ease: 'none',
      onUpdate: applyWrapped,
    });

    // Phase 2 — ease-out onto the chosen symbol.
    tl.add(() => {
      reel.classList.add('is-stopping');
    });
    tl.to(proxy, {
      y: targetY,
      duration: stopSeconds,
      ease: 'power3.out',
      onUpdate: applyWrapped,
      onComplete() {
        reel.classList.remove('is-spinning', 'is-stopping');
      },
    });
  });
}

/** Wire once per slide root: size tiles + auto-spin on first enter. */
export function wireSlotMachine(root, { gsap, reducedMotion = false } = {}) {
  if (!root) return;
  const machine = root.querySelector('.slot-machine');
  if (!machine || machine.dataset.slotWired === 'true') return;
  machine.dataset.slotWired = 'true';

  const resize = () => {
    if (machine.dataset.slotSpinning === 'true') return;
    const strips = [...machine.querySelectorAll('.slot-reel__strip')];
    const lands = strips.map((strip, index) => {
      const reel = machine.querySelectorAll('.slot-reel')[index];
      const prevH = Number.parseFloat(reel?.style.getPropertyValue('--slot-tile-h')) || reel?.getBoundingClientRect().height || 1;
      const y = Number(gsap?.getProperty(strip, 'y')) || 0;
      return Math.round(Math.abs(y) / prevH);
    });
    sizeReelTiles(machine);
    strips.forEach((strip, index) => {
      const reel = machine.querySelectorAll('.slot-reel')[index];
      const h = Number.parseFloat(reel?.style.getPropertyValue('--slot-tile-h')) || 1;
      const symbols = Number(reel?.dataset.symbols) || 1;
      const land = lands[index] % symbols;
      gsap?.set(strip, { y: -land * h });
    });
  };

  sizeReelTiles(machine);
  machine.querySelectorAll('.slot-reel__strip').forEach((strip) => {
    gsap?.set(strip, { y: 0 });
  });

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      sizeReelTiles(machine);
      spinSlotReels(root, { gsap, reducedMotion });
    });
  });

  window.addEventListener('resize', resize, { passive: true });
}
