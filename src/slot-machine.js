/**
 * Slot-machine reels for part1-28 (Hackathons. Funds. Talks.).
 * Kept separate so pull/spin logic does not fight parallax/rickroll edits in main.js.
 */

function sizeReelTiles(machine) {
  machine.querySelectorAll('.slot-reel').forEach((reel) => {
    const h = reel.clientHeight;
    if (!h) return;
    reel.style.setProperty('--slot-tile-h', `${h}px`);
    reel.querySelectorAll('.slot-tile').forEach((tile) => {
      tile.style.height = `${h}px`;
      tile.style.flexBasis = `${h}px`;
    });
  });
}

/**
 * Spin all reel strips. Safe to call on slide enter and on pull.
 */
export function spinSlotReels(root, { gsap, reducedMotion = false } = {}) {
  if (!root || !gsap) return;
  const machine = root.querySelector('.slot-machine');
  if (!machine) return;

  sizeReelTiles(machine);

  const lever = machine.querySelector('.slot-lever');
  const reels = [...machine.querySelectorAll('.slot-reel')];
  if (!reels.length) return;

  if (lever && !reducedMotion) {
    gsap.fromTo(
      lever,
      { rotate: 0 },
      {
        rotate: 28,
        duration: 0.18,
        yoyo: true,
        repeat: 1,
        transformOrigin: '50% 8%',
        ease: 'power2.inOut',
      },
    );
  }

  reels.forEach((reel, i) => {
    const strip = reel.querySelector('.slot-reel__strip');
    if (!strip) return;
    const symbols = Number(reel.dataset.symbols || Math.floor(strip.children.length / 2)) || 1;
    const h = reel.clientHeight;
    if (!h) return;

    gsap.killTweensOf(strip);
    const startY = Number(gsap.getProperty(strip, 'y')) || 0;
    const startIndex = Math.round(Math.abs(startY) / h) % symbols;
    gsap.set(strip, { y: -startIndex * h });

    const loops = 2 + (i % 2);
    const land = Math.floor(Math.random() * symbols);
    const targetY = -((loops * symbols) + land) * h;

    if (reducedMotion) {
      gsap.set(strip, { y: -land * h });
      return;
    }

    gsap.to(strip, {
      y: targetY,
      duration: 1.05 + i * 0.28,
      ease: 'power4.out',
      onComplete() {
        gsap.set(strip, { y: -land * h });
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

  sizeReelTiles(machine);
  machine.querySelectorAll('.slot-reel__strip').forEach((strip) => {
    gsap?.set(strip, { y: 0 });
  });

  // Second rAF: layout is settled after the slide fade-in.
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      sizeReelTiles(machine);
      spinSlotReels(root, { gsap, reducedMotion });
    });
  });

  window.addEventListener('resize', () => sizeReelTiles(machine), { passive: true });
}
