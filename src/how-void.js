/**
 * Slide part2-how: drag a pillar card, and on pointerup it spirals into
 * the center void (tightening orbit, shrink, fade). Other cards are untouched.
 * Pointer handlers never call preventDefault on keys, and the card is blurred
 * on release so deck arrow-key navigation keeps working.
 */

function pixelsPerLocalUnit(card, gsap) {
  const x0 = Number(gsap.getProperty(card, 'x')) || 0;
  const y0 = Number(gsap.getProperty(card, 'y')) || 0;
  const before = card.getBoundingClientRect();
  gsap.set(card, { x: x0 + 20, y: y0 });
  const after = card.getBoundingClientRect();
  gsap.set(card, { x: x0, y: y0 });
  const px = (after.left - before.left) / 20;
  return Number.isFinite(px) && Math.abs(px) > 0.01 ? px : 1;
}

function centerOf(rect) {
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
}

function releaseFocus(card) {
  const active = document.activeElement;
  if (active === card || (active && card.contains(active))) active.blur();
}

function syncDevouring(hole) {
  const root = hole.closest('[data-interaction="how-void"]');
  const falling = root?.querySelector('[data-how-card].is-falling');
  hole.classList.toggle('is-devouring', Boolean(falling));
}

function spiralIntoVoid(card, hole, { gsap, reducedMotion }) {
  if (card.classList.contains('is-consumed') || card.classList.contains('is-falling')) return;
  const slide = card.closest('.slide');
  if (!slide?.classList.contains('is-active')) return;

  gsap.killTweensOf(card);
  const unit = pixelsPerLocalUnit(card, gsap);
  const holeRect = hole.getBoundingClientRect();
  const cardRect = card.getBoundingClientRect();
  if (holeRect.width < 2 || cardRect.width < 2) return;

  const holeC = centerOf(holeRect);
  const cardC = centerOf(cardRect);
  const relX = cardC.x - holeC.x;
  const relY = cardC.y - holeC.y;
  const radius0 = Math.max(1, Math.hypot(relX, relY));
  const angle0 = Math.atan2(relY, relX);
  const turns = reducedMotion ? 0.45 : 2.15;
  const duration = reducedMotion ? 0.4 : 1.35;

  card.classList.add('is-falling');
  card.classList.remove('is-dragging');
  syncDevouring(hole);
  releaseFocus(card);

  const state = { p: 0 };
  gsap.to(state, {
    p: 1,
    duration,
    ease: 'none',
    onUpdate() {
      if (!slide.classList.contains('is-active')) return;
      const liveHole = hole.getBoundingClientRect();
      if (liveHole.width < 2) return;
      const live = centerOf(liveHole);
      const p = state.p;
      const spinT = reducedMotion ? p : p ** 1.15;
      const fallT = reducedMotion ? p : p ** 2.55;
      const radius = radius0 * (1 - fallT);
      const angle = angle0 + turns * Math.PI * 2 * spinT;
      const desiredX = live.x + Math.cos(angle) * radius;
      const desiredY = live.y + Math.sin(angle) * radius;
      const rect = card.getBoundingClientRect();
      const current = centerOf(rect);
      const closeness = 1 - radius / radius0;
      const scale = Math.max(0.02, 1 - closeness ** 1.15);
      const opacity = closeness < 0.72 ? 1 : Math.max(0, 1 - (closeness - 0.72) / 0.28);
      gsap.set(card, {
        x: (Number(gsap.getProperty(card, 'x')) || 0) + (desiredX - current.x) / unit,
        y: (Number(gsap.getProperty(card, 'y')) || 0) + (desiredY - current.y) / unit,
        scale,
        rotation: ((angle - angle0) * 180) / Math.PI,
        opacity,
        zIndex: 40,
      });
    },
    onComplete() {
      gsap.set(card, { opacity: 0, scale: 0, pointerEvents: 'none' });
      card.classList.remove('is-falling');
      card.classList.add('is-consumed');
      card.setAttribute('aria-hidden', 'true');
      syncDevouring(hole);
      releaseFocus(card);
    },
  });
}

export function wireHowVoid(root, { gsap, reducedMotion = false }) {
  const section = root.querySelector('[data-interaction="how-void"]');
  if (!section || section.dataset.voidWired === 'true') return;
  const hole = section.querySelector('.how-void');
  const cards = [...section.querySelectorAll('[data-how-card]')];
  if (!hole || !cards.length) return;
  section.dataset.voidWired = 'true';

  cards.forEach((card) => {
    let drag = null;

    const endDrag = (event) => {
      if (!drag || (event && event.pointerId !== drag.id)) return;
      drag = null;
      if (event && card.hasPointerCapture?.(event.pointerId)) {
        card.releasePointerCapture(event.pointerId);
      }
      card.classList.remove('is-dragging');
      releaseFocus(card);
      requestAnimationFrame(() => releaseFocus(card));
      if (card.classList.contains('is-consumed')) return;
      spiralIntoVoid(card, hole, { gsap, reducedMotion });
    };

    const onWindowEnd = (event) => {
      window.removeEventListener('pointerup', onWindowEnd);
      window.removeEventListener('pointercancel', onWindowEnd);
      endDrag(event);
    };

    card.addEventListener('pointerdown', (event) => {
      if (event.button !== 0) return;
      if (card.classList.contains('is-consumed') || card.classList.contains('is-falling')) return;
      // Block native drag/text selection only. Do not touch key events.
      event.preventDefault();
      gsap.killTweensOf(card);
      try { card.setPointerCapture(event.pointerId); } catch { /* already captured */ }
      drag = {
        id: event.pointerId,
        startX: Number(gsap.getProperty(card, 'x')) || 0,
        startY: Number(gsap.getProperty(card, 'y')) || 0,
        px: event.clientX,
        py: event.clientY,
      };
      card.classList.add('is-dragging');
      gsap.set(card, { zIndex: 30 });
      gsap.to(card, { scale: 1.06, duration: 0.12, overwrite: 'auto' });
      releaseFocus(card);
      window.addEventListener('pointerup', onWindowEnd);
      window.addEventListener('pointercancel', onWindowEnd);
    });

    card.addEventListener('pointermove', (event) => {
      if (!drag || event.pointerId !== drag.id) return;
      gsap.set(card, {
        x: drag.startX + (event.clientX - drag.px),
        y: drag.startY + (event.clientY - drag.py),
      });
    });
  });
}
