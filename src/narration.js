// Voice-over playback + auto-advance, aligned to the CodexTalk video (6:24).
//
// One continuous audio track (the video's own soundtrack). Every slide maps
// to its segment on the video timeline, so the narration keeps flowing across
// slides exactly like the recording - slides with no spoken beat simply let
// the previous sound keep sounding - and auto-advance reproduces the video's
// pacing slide by slide.

const AUDIO_URL = './assets/codextalk-narration.m4a';

// [slideId, startSeconds, endSeconds] in the video's slide order.
// Timings measured from codextalk-video-720p.mp4 (scene-cut detection,
// manually verified against the frames).
const TIMELINE = [
  ['part1-01-hook', 0.0, 20.0],
  ['part1-02-background', 20.0, 21.5],
  ['part1-03-about', 21.5, 26.0],
  ['part1-04-adventure-games', 26.0, 29.0],
  ['part1-05-platforms', 29.0, 31.0],
  ['part1-06-adventure-publishing', 31.0, 33.0],
  ['part1-08-xr', 33.0, 36.0],
  ['part1-09-sidequests', 36.0, 45.5],
  ['part1-07-community', 45.5, 50.5],
  ['part1-10-twenty-years', 50.5, 53.5],
  ['part1-11-projects-year', 53.5, 67.5],
  ['part1-12-then', 67.5, 72.5],
  ['part1-13-now', 72.5, 83.5],
  ['part1-14-ai-happened', 83.5, 104.0],
  // The video holds a "04 THE NINETEEN" chapter card here; the deck's
  // count-together beat owns that slot.
  ['part1-14c-count-together', 104.0, 105.5],
  ['part1-14b-current-projects', 105.5, 108.5],
  ['part1-15-currency', 108.5, 112.8],
  ['part1-16-car-appraiser', 112.8, 117.7],
  ['part1-17-show-tracker', 117.7, 122.5],
  ['part1-18-feed-the-feed', 122.5, 124.7],
  ['part1-19-camsport', 124.7, 127.3],
  ['part1-20-kaiju-qa', 127.3, 132.3],
  ['part1-21-improv-dashboard', 132.3, 137.5],
  ['part1-22-improv-calendar', 137.5, 140.0],
  ['part1-24-jigtrade', 140.0, 144.5],
  ['part1-25-glasses', 144.5, 151.0],
  ['part1-26-meditation', 151.0, 155.0],
  ['part1-27-save-point', 155.0, 161.5],
  ['part1-27b-misc-projects', 161.5, 172.5],
  ['part1-27c-task-swipe', 172.5, 175.0],
  ['part1-27d-this-talk', 175.0, 177.7],
  // Includes the video's "05 THE CUT" chapter card.
  ['part1-28-hackathons-funds-talks', 177.7, 189.0],
  ['part1-29-the-cut', 189.0, 198.0],
  ['part2-how', 198.0, 209.5],
  ['part2-planning-repo', 209.5, 220.5],
  ['part2-markdown-handoffs', 220.5, 230.0],
  ['part2-parallel-adversarial', 230.0, 243.0],
  ['part2-adhd-feature', 243.0, 259.0],
  ['part2-symphony', 259.0, 268.5],
  ['part2-project-20', 268.5, 281.0],
  ['part2-azure', 281.0, 292.0],
  ['part2-twelve-thousand', 292.0, 299.5],
  ['part2-unrestricted', 299.5, 313.5],
  ['part2-software-changing', 313.5, 327.5],
  ['part2-everyone-developer', 327.5, 340.0],
  ['part2-hyper-personalized', 340.0, 351.0],
  ['part2-taskswipe', 351.0, 363.5],
  ['part2-everything', 363.5, 365.0],
  ['part2-everywhere', 365.0, 366.5],
  ['part2-all-at-once', 366.5, 368.0],
  ['part2-qr-close', 368.0, 383.5],
];

const ORDER = TIMELINE.map(([id]) => id);
const BY_ID = Object.fromEntries(TIMELINE.map(([id, start, end]) => [id, { start, end }]));
// How long to hold a slide that never appears in the video (LoveLink)
// before auto-advance moves on; the narration keeps playing meanwhile.
const UNSCORED_DWELL_SECONDS = 4;

export function initNarration({ slides, getCurrent, showSlide }) {
  const audio = new Audio(AUDIO_URL);
  audio.preload = 'auto';
  audio.style.display = 'none';
  document.body.appendChild(audio);

  let playing = false;
  let advanceTimer = null;

  const button = document.createElement('button');
  button.className = 'icon-button narration-toggle';
  button.type = 'button';
  button.setAttribute('aria-pressed', 'false');
  button.setAttribute('aria-label', 'Play the talk with narration and auto-advance');
  document.querySelector('.chrome')?.appendChild(button);

  const paint = () => {
    button.textContent = playing ? '⏸ Stop talk' : '▶ Play talk';
    button.setAttribute('aria-pressed', playing ? 'true' : 'false');
  };
  paint();

  const clearAdvance = () => {
    if (advanceTimer) clearTimeout(advanceTimer);
    advanceTimer = null;
  };

  const stop = () => {
    playing = false;
    clearAdvance();
    audio.pause();
    paint();
  };

  const advance = () => {
    if (!playing) return;
    const currentId = slides[getCurrent()]?.id;
    const position = ORDER.indexOf(currentId);
    const nextId = position >= 0 ? ORDER[position + 1] : slides[getCurrent() + 1]?.id;
    if (!nextId) { stop(); return; }
    const nextIndex = slides.findIndex((slide) => slide.id === nextId);
    if (nextIndex < 0) { stop(); return; }
    showSlide(nextIndex, 1);
  };

  // Called from showSlide every time the visible slide changes.
  const onSlideChanged = (index) => {
    if (!playing) return;
    clearAdvance();
    const entry = BY_ID[slides[index]?.id];
    if (entry) {
      // Manual jump (or drift): re-sync only when the playhead left this
      // slide's segment, so auto-advances stay gapless.
      const t = audio.currentTime;
      if (t < entry.start - 0.75 || t >= entry.end) audio.currentTime = entry.start;
      const remaining = Math.max(0.3, entry.end - audio.currentTime);
      advanceTimer = setTimeout(advance, remaining * 1000);
    } else {
      // No video presence: let the current audio keep sounding, hold briefly.
      advanceTimer = setTimeout(advance, UNSCORED_DWELL_SECONDS * 1000);
    }
  };

  const start = () => {
    if (playing) return;
    playing = true;
    paint();
    audio.play().catch(() => stop());
    onSlideChanged(getCurrent());
  };

  button.addEventListener('click', () => (playing ? stop() : start()));
  document.addEventListener('keydown', (event) => {
    if (event.defaultPrevented) return;
    if (event.target?.closest?.('input, textarea, [contenteditable="true"], dialog')) return;
    if (event.key.toLowerCase() === 'n') (playing ? stop() : start());
  });
  audio.addEventListener('ended', stop);

  window.__narration = { audio, onSlideChanged };
  return { onSlideChanged };
}
