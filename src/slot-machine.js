/**
 * Slot-machine reels for part1-28 (Hackathons. Funds. Talks.).
 * Kept separate so pull/spin logic does not fight parallax/rickroll edits in main.js.
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
  return { strip, symbols, h };
}

/**
 * Spin all three reel strips. Safe to call on slide enter and on lever pull.
 */
export function spinSlotReels(root, { gsap, reducedMotion = false } = {}) {
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

  if (lever && !reducedMotion) {
    gsap.fromTo(
      lever,
      { rotate: 0 },
      {
        rotate: 32,
        duration: 0.2,
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
    const { strip, symbols, h } = metrics;

    gsap.killTweensOf(strip);
    const startY = Number(gsap.getProperty(strip, 'y')) || 0;
    const startIndex = Math.round(Math.abs(startY) / h) % symbols;
    gsap.set(strip, { y: -startIndex * h });

    const loops = 2 + (i % 3);
    const land = Math.floor(Math.random() * symbols);
    const targetY = -((loops * symbols) + land) * h;

    if (reducedMotion) {
      gsap.set(strip, { y: -land * h });
      done();
      return;
    }

    gsap.to(strip, {
      y: targetY,
      duration: 1.15 + i * 0.32,
      ease: 'power4.out',
      onComplete() {
        const again = reelMetrics(reel);
        const tileH = again?.h || h;
        gsap.set(strip, { y: -land * tileH });
        done();
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
