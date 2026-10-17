/**
 * Slide "Everyone is a developer." (part2-everyone-developer).
 * Middle card strikes "code" and brightens the other two.
 * "Make it yours" shrinks the first two, fills the slide with the third,
 * and recolors the app screen behind it. Both states can be on together.
 * Clicks stay on the cards: they do not move the deck. Arrow keys still do.
 */
import './everyone-developer.css';

const STAGE = '[data-interaction="everyone-developer"]';

function sync(stage) {
  const yoursOn = stage.classList.contains('is-yours');
  const struck = stage.classList.contains('is-struck');
  stage.querySelector('[data-maker="ask"]')?.setAttribute('aria-pressed', struck ? 'true' : 'false');
  stage.querySelector('[data-maker="yours"]')?.setAttribute('aria-pressed', yoursOn ? 'true' : 'false');
  const title = stage.querySelector('.yours-screen__title');
  if (title) title.textContent = yoursOn ? 'Yours' : 'App';
}

document.addEventListener('click', (event) => {
  const control = event.target?.closest?.(`${STAGE} [data-maker]`);
  if (!control) return;
  const stage = control.closest(STAGE);
  if (!stage) return;

  event.preventDefault();
  event.stopPropagation();

  const which = control.dataset.maker;
  if (which === 'ask') stage.classList.add('is-struck');
  if (which === 'yours') stage.classList.add('is-yours');
  sync(stage);

  if (event.detail !== 0) control.blur();
}, true);
