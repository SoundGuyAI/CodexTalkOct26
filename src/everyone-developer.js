/**
 * Slide "Everyone is a developer." (part2-everyone-developer).
 * "Change" grows to fill a white card. "Ask" grows, "don’t code" is struck,
 * and that card turns white too. "Make it yours" stays a black card and can
 * still take over the stage. Clicks stay on the cards. Arrow keys still move the deck.
 * Word growth is not shortened for prefers-reduced-motion.
 */
import './everyone-developer.css';

const STAGE = '[data-interaction="everyone-developer"]';

function sync(stage) {
  const yoursOn = stage.classList.contains('is-yours');
  const struck = stage.classList.contains('is-struck');
  const changed = stage.classList.contains('is-changed');
  stage.querySelector('[data-maker="change"]')?.setAttribute('aria-pressed', changed ? 'true' : 'false');
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
  if (which === 'change') stage.classList.add('is-changed');
  if (which === 'ask') stage.classList.add('is-struck');
  if (which === 'yours') stage.classList.add('is-yours');
  sync(stage);

  if (event.detail !== 0) control.blur();
}, true);
