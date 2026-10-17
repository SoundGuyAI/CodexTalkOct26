const asset = (path, alt = '') => path.endsWith('.webm')
  ? `<video src="./assets/${path}" aria-label="${alt}" autoplay muted loop playsinline data-depth="2"></video>`
  : `<img src="./assets/${path}" alt="${alt}" loading="eager" data-depth="2">`;

const hotspot = (label, extra = '') =>
  `<button type="button" class="hotspot" data-hotspot="true" aria-label="${label}" ${extra}>${label}</button>`;

const cards = (items) => items.map((item, index) => `
  <button type="button" class="project-card project-card--${index + 1}" data-project="${item.label}" data-depth="${index % 3 + 1}">
    ${item.image ? asset(item.image, item.label) : ''}
    <span>${item.label}</span>
  </button>`).join('');

const yearlyProjects = [
  [2006, 2], [2007, 6], [2008, 6], [2009, 8], [2010, 11], [2011, 11],
  [2012, 9], [2013, 9], [2014, 10], [2015, 8], [2016, 9], [2017, 10],
  [2018, 13], [2019, 10], [2020, 9], [2021, 6], [2022, 9], [2023, 14],
  [2024, 6], [2025, 18], [2026, 36],
];

/** Era labels shown in bar titles / hover bubbles (not every inventory line). */
const yearHoverLabels = {
  2006: 'Corbomite',
  2007: 'Zbang',
  2009: 'Pizza Morgana',
  2010: 'Star Shipping',
  2013: 'Bolt Riley',
  2014: "Herbert's Quest · Uniform",
  2016: 'Bolt Riley EA',
  2018: 'XR + maker years',
  2020: 'Oh SHIP! · BRCvr',
  2021: 'BRCvr',
  2023: 'Oh SHIP! AI',
  2025: 'LoveLink',
  2026: 'AI Agents',
};

const chartPinCatalog = [
  { year: 2006, label: 'Corbomite', image: 'history/corbomite-logo.jpg' },
  { year: 2007, label: 'Zbang', image: 'history/zbang-banner.jpg' },
  { year: 2009, label: 'Pizza Morgana', image: 'history/pizza-morgana-logo.png' },
  { year: 2010, label: 'Star Shipping', image: 'history/star-shipping-hd1.jpg' },
  { year: 2013, label: 'Bolt Riley', image: 'history/bolt-riley.jpg' },
  { year: 2014, label: "Herbert's Quest", image: 'history/herberts-quest.jpg' },
  { year: 2020, label: 'Oh SHIP!', image: 'history/oh-ship-logo.jpg' },
  { year: 2021, label: 'BRCvr', image: 'history/brcvr-playa.jpg' },
  { year: 2025, label: 'LoveLink', image: 'projects/lovelink.jpg' },
  { year: 2026, label: 'AI Agents', image: 'projects/kaiju-qa.png' },
];

const chartPinByYear = Object.fromEntries(chartPinCatalog.map((pin) => [pin.year, pin]));

/**
 * Image bubbles scattered in the empty sky above the shorter bars.
 * `anchor` is a fixed fraction down the 2026 smash bar (arrowhead stays there).
 * x/y are percentages of the chart, spread across the top — not one column.
 */
const chart2026Callouts = [
  { label: 'LoveLink', image: 'projects/lovelink.jpg', x: 22, y: 16, anchor: 0.22 },
  { label: 'Save Point', image: 'projects/save-point-itch.jpg', x: 36, y: 16, anchor: 0.38 },
  { label: 'Improv Dashboard', image: 'projects/improv-dashboard.png', x: 54, y: 3, anchor: 0.52 },
  { label: 'TaskSwipe', image: 'projects/taskswipe-placeholder.png', x: 68, y: 18, anchor: 0.66 },
  { label: 'Kaiju QA', image: 'projects/kaiju-qa.png', x: 28, y: 32, anchor: 0.8 },
];

const barHeightPct = (count) => Math.max(11, (count / 36) * 100);

const yearlyProjectBars = (throughYear, highlightYear = null) => yearlyProjects
  .filter(([year]) => year <= throughYear)
  .map(([year, count]) => {
    const era = yearHoverLabels[year];
    const label = era ? `${year}: ${count} projects · ${era}` : `${year}: ${count} projects`;
    return `
  <button
    type="button"
    class="year-bar${year === highlightYear ? ' is-current' : ''}${year === 2026 && highlightYear === 2026 ? ' is-smash' : ''}${chartPinByYear[year] ? ' has-pin' : ''}"
    style="--bar-height:${barHeightPct(count)}%"
    data-year="${year}"
    aria-label="${label}"
    title="${label}"
  >
    <strong class="year-total">${count}</strong>
    <span class="year-label">${year}</span>
    ${era ? `<span class="year-bubble">${era}</span>` : ''}
  </button>`;
  }).join('');

/** Pins sit in a grid matching the bars so each bubble hangs just above its tip. */
const yearlyProjectPins = (throughYear, highlightYear = null) => {
  const slots = yearlyProjects
    .filter(([year]) => year <= throughYear)
    .map(([year, count]) => {
      const pin = chartPinByYear[year];
      // On the agents smash slide, 2026 uses left callouts instead of a tip pin.
      const showPin = pin && !(year === 2026 && highlightYear === 2026);
      return `
    <div class="year-pin-slot" style="--bar-height:${barHeightPct(count)}%" data-year="${year}">
      ${showPin ? `
        <figure class="year-project-pin pin-${pin.year}" data-draggable="true" data-year="${pin.year}" data-leader="${pin.year}">
          <img src="./assets/${pin.image}" alt="" draggable="false">
          <figcaption>${pin.label}</figcaption>
          <i class="year-project-pin__stem" aria-hidden="true"></i>
        </figure>` : ''}
    </div>`;
    }).join('');
  return `<div class="year-project-pins" aria-hidden="true">${slots}</div>`;
};

/** Slides 11–12: one leader per pin. Arrow stays on that year's bar tip. */
const pinLeaderMarkup = (throughYear) => {
  const years = yearlyProjects
    .filter(([year]) => year <= throughYear && chartPinByYear[year])
    .map(([year]) => year);
  if (!years.length) return '';
  const markerId = `chart-pin-arrow-${throughYear}`;
  return `
    <svg class="chart-leaders chart-leaders--pins" aria-hidden="true">
      <defs>
        <marker id="${markerId}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M0 0 L10 5 L0 10 Z" fill="#ff3b81"></path>
        </marker>
      </defs>
      ${years.map((year) => `<line data-leader="${year}" marker-end="url(#${markerId})"></line>`).join('')}
    </svg>`;
};

const yearlyChart = ({ throughYear, highlightYear = null, phase }) => `
  <section class="yearly-chart${highlightYear === 2026 ? ' yearly-chart--agents' : ''}" data-interaction="year-bars">
    <header class="yearly-chart__heading">
      <h2>${highlightYear === 2025 ? '2025' : highlightYear === 2026 ? '2026' : 'Projects / year'}</h2>
      ${highlightYear === 2026 ? '<p class="yearly-chart__era">AI Agents</p>' : ''}
    </header>
    ${phase ? `<div class="yearly-chart__phase">${phase}</div>` : ''}
    <div class="year-bars" role="img" aria-label="Projects active in each year from 2006 to ${throughYear}">
      ${yearlyProjectBars(throughYear, highlightYear)}
    </div>
    ${yearlyProjectPins(throughYear, highlightYear)}
    ${highlightYear === 2026 ? '' : pinLeaderMarkup(throughYear)}
    ${highlightYear === 2026 ? `
      <svg class="chart-leaders" aria-hidden="true">
        <defs>
          <marker id="chart-leader-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
            <path d="M0 0 L10 5 L0 10 Z" fill="#ff3b81"></path>
          </marker>
        </defs>
        ${chart2026Callouts.map((item, index) => `<line data-leader="${index}" marker-end="url(#chart-leader-arrow)"></line>`).join('')}
      </svg>
      <div class="chart-callouts" aria-label="Projects in the AI Agents year">
        ${chart2026Callouts.map((item, index) => `
          <figure class="chart-callout" data-draggable="true" data-leader="${index}" data-anchor="${item.anchor}" style="left:${item.x}%;top:${item.y}%">
            <img src="./assets/${item.image}" alt="" draggable="false">
            <figcaption>${item.label}</figcaption>
          </figure>`).join('')}
      </div>` : ''}
    <p class="yearly-chart__hint">hover a bar · drag bubbles</p>
  </section>`;

export const part1Slides = [
  {
    id: 'part1-01-hook',
    duration: 8,
    title: 'Everything Everywhere All at Once',
    className: 'slide-hook slide-multiverse',
    html: `
      <section class="hero-grid" data-interaction="tilt-grid" aria-label="Nineteen projects">
        <h1 data-depth="1">Everything Everywhere<br><em>All at Once</em></h1>
        <p data-depth="2">how to work on 19 projects simultaneously</p>
        <div class="project-grid" data-depth="3">
          ${cards([
            { label: 'LoveLink', image: 'projects/lovelink.jpg' },
            { label: 'Save Point', image: 'projects/save-point.webm' },
            { label: 'Where Are My Glasses?', image: 'projects/where-are-my-glasses.jpg' },
            { label: 'Meditation: EXTREME!!!1', image: 'projects/meditation-extreme.jpg' },
            { label: 'Feed The Feed', image: 'projects/feed-the-feed.png' },
            { label: 'JigTrade', image: 'projects/jigtrade.png' },
            { label: 'Improv Dashboard', image: 'projects/improv-dashboard.png' },
            { label: 'CamSport', image: 'projects/camsport.png' },
          ])}
        </div>
        ${hotspot('Tilt the grid', 'data-action="tilt"')}
      </section>`,
    notes: 'Open with: “How do I manage 19 projects? I do not. But here we are.” Let the pointer tilt the project grid.'
  },
  {
    id: 'part1-02-background',
    duration: 2,
    title: 'Background',
    className: 'slide-section-break chromatic',
    html: `<section class="section-break" data-effect="chromatic-jump"><span>BACKGROUND</span></section>`,
    notes: 'This did not begin with AI.'
  },
  {
    id: 'part1-03-about',
    duration: 15,
    title: 'Who am I?',
    className: 'slide-about orbit',
    html: `
      <section class="about-orbit" data-interaction="pause-orbit">
        <div class="orbit-photo orbit-photo--main" data-depth="1">${asset('about/oded-portrait.jpg', 'Oded')}</div>
        <div class="orbit-photo orbit-photo--burner" data-depth="3">${asset('about/oded-burner.jpg', 'Oded at Burning Man')}</div>
        <div class="orbit-mark orbit-mark--corbomite" data-depth="2">${asset('history/corbomite-logo.jpg', 'Corbomite logo')}</div>
        <div class="orbit-mark orbit-mark--adventure" data-depth="2">${asset('history/adventure-mob-logo.jpg', 'Adventure Mob logo')}</div>
        <div class="about-copy" data-depth="1"><h2>Who am I?</h2><p>games · XR · improv · ADHD</p></div>
        ${hotspot('Pause orbit', 'data-action="pause-orbit"')}
      </section>`,
    notes: 'Thirty years making games. Indie developer, XR creator, improviser, ADHD.'
  },
  {
    id: 'part1-04-adventure-games',
    duration: 2,
    title: 'Adventure games',
    className: 'slide-collage scrapbook',
    html: `<section class="scrapbook-collage collage--logos tile-grid tile-grid--logos" data-interaction="snap-collage"><h2 class="sr-only">Adventure games</h2>${cards([
      { label: 'Zbang', image: 'history/zbang-logo.png' },
      { label: 'Pizza Morgana', image: 'history/pizza-morgana-tile.png' },
      { label: 'KISA', image: 'history/kisa-logo.png' },
      { label: 'Heavenly Hell', image: 'history/heavenly-hell-logo.png' },
    ])}</section>`,
    notes: 'Fast chronology: Zbang, Pizza Morgana, Knights In Shining Armor (KISA), Heavenly Hell. No Rock Band here.'
  },
  {
    id: 'part1-05-platforms',
    duration: 2,
    title: 'Different platforms',
    className: 'slide-collage platforms',
    html: `<section class="platform-collage collage--logos tile-grid tile-grid--logos" data-interaction="snap-collage"><h2 class="sr-only">Different platforms</h2>${cards([
      { label: 'Star Shipping', image: 'history/star-shipping-logo.png' },
      { label: 'Spinning Cube', image: 'history/spinning-cube-logo.png' },
      { label: 'Larry demo', image: 'history/larry-kickstarter.png' },
      { label: 'Interface Incineration', image: 'history/interface-incineration.png' },
    ])}</section>`,
    notes: 'Star Shipping + Spinning Cube logos from Corbomite. Larry is the Kickstarter page. Interface Incineration replaces Gun N’ Blade.'
  },
  {
    id: 'part1-06-adventure-publishing',
    duration: 2,
    title: 'Adventure games and publishing',
    className: 'slide-collage publishing',
    html: `<section class="publishing-collage collage--logos tile-grid tile-grid--logos" data-interaction="snap-collage"><h2 class="sr-only">Adventure games and publishing</h2>${cards([
      { label: 'Bolt Riley', image: 'history/bolt-riley-intro.jpg' },
      { label: 'Avner', image: 'history/avner-icon.jpg' },
      { label: "Herbert's Quest", image: 'history/herberts-quest.jpg' },
      { label: 'Uniform', image: 'history/uniform-logo.jpg' },
    ])}</section>`,
    notes: 'Bolt Riley, Avner, Herbert’s Quest, Uniform (replaced Nightmare Playground).'
  },
  {
    id: 'part1-08-xr',
    duration: 2,
    title: 'XR added more worlds',
    className: 'slide-collage xr',
    html: `<section class="xr-collage collage--logos tile-grid tile-grid--logos" data-interaction="snap-collage"><h2 class="sr-only">XR worlds</h2>${cards([
      { label: 'Star Mates', image: 'history/star-mates-gdc.jpg' },
      { label: 'BRCvr', image: 'history/brcvr-playa.jpg' },
      { label: 'Oh SHIP!', image: 'history/oh-ship-logo.jpg' },
      { label: 'Time to Escape', image: 'history/oh-ship-time-to-escape.jpg' },
    ])}</section>`,
    notes: 'XR worlds: Star Mates, BRCvr, Oh SHIP! logo, Oh SHIP! Time to Escape trailer still (replaces StreetWize; logo was not on Corbomite).'
  },
  {
    id: 'part1-09-sidequests',
    duration: 2,
    title: 'The side quests did not stop',
    className: 'slide-collage sidequests',
    html: `<section class="sidequest-collage tile-grid tile-grid--photos" data-interaction="snap-collage"><h2 class="sr-only">Side quests</h2>${cards([
      { label: 'Geekcon', image: 'sidequests/geekcon-steam-engine.jpg' },
      { label: 'Midburn pyro', image: 'about/burning-man-sculpture.jpg' },
      { label: 'Fireworks', image: 'about/fireworks.jpg' },
      { label: 'Imperial March', image: 'sidequests/imperial-march-hdd.jpg' },
    ])}</section>`,
    notes: 'Geekcon steam engine; Midburn pyro (was mislabeled Burning Man); fireworks; Imperial March HDD (YouTube: “yet another hard drive playing Imperial March”).'
  },
  {
    id: 'part1-07-community',
    duration: 2,
    title: 'Organize, teach, speak, jam',
    className: 'slide-collage community',
    html: `<section class="community-collage community-photos" data-interaction="snap-collage"><h2 class="sr-only">Community</h2>${[
      'community/award-stage.jpg',
      'community/gdc-schedule.jpg',
      'community/group-photo.jpg',
    ].map((image, index) => `<button type="button" class="project-card project-card--${index + 1}" data-depth="${index % 3 + 1}">${asset(image, '')}</button>`).join('')}</section>`,
    notes: 'I also organized, taught, spoke, and jammed.'
  },
  {
    id: 'part1-10-twenty-years',
    duration: 5,
    title: '20 years.',
    className: 'slide-mosaic-collapse',
    html: `<section class="mosaic-collapse" data-interaction="pull-tiles"><h2 data-depth="1">20 years.</h2><div class="tiny-mosaic tile-grid tile-grid--mosaic" data-depth="3">${cards([
      { label: 'making', image: 'about/oded-maker.jpg' },
      { label: 'worlds', image: 'history/brcvr-playa.jpg' },
      { label: 'games', image: 'history/bolt-riley.jpg' },
      { label: 'people', image: 'about/oded-burner.jpg' },
    ])}</div>${hotspot('Pull tiles out', 'data-action="pull-tiles"')}</section>`,
    notes: 'Busy was already normal.'
  },
  {
    id: 'part1-11-projects-year',
    duration: 12,
    title: 'Projects / year',
    className: 'slide-chart yearly-projects',
    html: yearlyChart({ throughYear: 2024, phase: '2006–2024' }),
    notes: 'This is the actual annual inventory from 2006 through 2024. Each bar is projects active that year, not only starts. 2019 is corrected to 10 (inventory undercount). Hover bars for era names: Corbomite, Zbang, Pizza Morgana, Star Shipping, Bolt Riley, Herbert’s Quest, Oh SHIP!, BRCvr.'
  },
  {
    id: 'part1-12-then',
    duration: 5,
    title: '2025',
    className: 'slide-chart yearly-projects yearly-projects--2025',
    html: yearlyChart({ throughYear: 2025, highlightYear: 2025, phase: '18 projects' }),
    notes: 'Keep the chart fixed and add only the 2025 bar: eighteen active projects. The baseline moved. Big on-screen title: 2025.'
  },
  {
    id: 'part1-13-now',
    duration: 7,
    title: '2026',
    className: 'slide-chart yearly-projects yearly-projects--2026',
    html: yearlyChart({ throughYear: 2026, highlightYear: 2026, phase: '36 projects' }),
    notes: 'Keep the same chart and smash the 2026 bar past the frame: thirty-six active projects. Project bubbles are scattered in the empty sky above the shorter bars. Each leader line stays pinned to a fixed point on the 36-projects bar and stretches when a bubble is dragged.'
  },
  {
    id: 'part1-14-ai-happened',
    duration: 18,
    title: 'AI Happened',
    className: 'slide-agent-windows',
    html: `<section class="agent-era-wall" data-interaction="cursor-dominance" aria-label="AI era transition">
      <h2 data-depth="1">AI Happened</h2>
      <div class="era-split" data-depth="2">
        <article class="era-pane era-pane--before" data-depth="2">
          <span class="era-pane__tag">before</span>
          <strong>one pair of hands</strong>
          <div class="era-pane__lines" aria-hidden="true"><i></i><i></i><i></i></div>
        </article>
        <div class="era-jump" data-depth="4" aria-hidden="true"><span>↯</span></div>
        <article class="era-pane era-pane--after" data-depth="3">
          <span class="era-pane__tag">after</span>
          <strong>many loops</strong>
          <div class="agent-windows agent-windows--era">
            <button type="button" class="agent-window" data-agent="research" data-depth="2">research</button>
            <button type="button" class="agent-window" data-agent="code" data-depth="3">code</button>
            <button type="button" class="agent-window" data-agent="tests" data-depth="2">tests</button>
            <button type="button" class="agent-window" data-agent="art" data-depth="4">art</button>
            <button type="button" class="agent-window" data-agent="ship" data-depth="3">ship</button>
          </div>
        </article>
      </div>
      <p class="era-caption" data-depth="2">move the cursor — windows wake up</p>
    </section>`,
    notes: 'I stopped being the person doing every keystroke and became the person steering many loops. Cursor movement changes which agent window dominates.'
  },
  {
    id: 'part1-14b-current-projects',
    duration: 10,
    title: 'Current projects in 2026',
    className: 'slide-now-projects',
    html: (() => {
      const projects = [
        { label: 'LoveLink', image: 'projects/lovelink.jpg' },
        { label: 'Save Point', image: 'projects/savepoint-hero.png' },
        { label: 'Glasses', image: 'projects/where-are-my-glasses-cover.png', full: 'Where Are My Glasses?' },
        { label: 'Meditation Extreme', image: 'projects/meditation-extreme.jpg' },
        { label: 'Feed The Feed', image: 'projects/feed-the-feed.png' },
        { label: 'JigTrade', image: 'projects/jigtrade.png' },
        { label: 'Improv', image: 'projects/improv-dashboard.png' },
        { label: 'CamSport', image: 'projects/camsport.png' },
        { label: 'Kaiju QA', image: 'projects/kaiju-qa.png' },
        { label: 'TaskSwipe', image: 'projects/taskswipe-mockup.png' },
      ];
      const tile = (item, index) => `
        <button type="button" class="now-tile${index === 0 ? ' is-forward' : ''}" data-project="${item.label}" aria-pressed="${index === 0 ? 'true' : 'false'}" aria-label="${item.full || item.label}">
          <span class="now-tile__art"><img src="./assets/${item.image}" alt="" draggable="false"></span>
          <span class="now-tile__name">${item.label}</span>
        </button>`;
      return `
        <section class="now-projects" data-interaction="now-projects" aria-labelledby="now-projects-title">
          <header class="now-projects__head">
            <h2 id="now-projects-title">Current projects in <span class="now-year">2026</span></h2>
          </header>
          <div class="now-stage">${projects.map(tile).join('')}</div>
          <p class="now-hint">click a project — it comes forward</p>
        </section>`;
    })(),
    notes: 'The projects in motion in 2026 — a spotlight, not the year chart and not the weekly cut. Click a tile to pull that project forward; the others keep a slow drift. LoveLink, Save Point, Glasses, Meditation Extreme, Feed The Feed, JigTrade, Improv, CamSport, Kaiju QA, TaskSwipe.'
  },
  {
    id: 'part1-14c-count-together',
    duration: 4,
    title: 'Count with me together.',
    className: 'slide--count-together',
    html: `
      <section class="count-together" aria-labelledby="count-together-title">
        <h2 id="count-together-title" data-depth="1">Count with me together.</h2>
      </section>`,
    notes: 'Title beat. Read it and leave the room a moment with the sentence.'
  },
  {
    id: 'part1-15-currency',
    duration: 2,
    title: 'Currency converter',
    className: 'slide-project utility currency',
    html: `<section class="life-tool life-tool--fx" data-interaction="currency-mock">
      <h2 data-depth="1">Currency converter</h2>
      <form class="fx-panel" action="#" autocomplete="off">
        <label class="fx-amount">
          <span>JPY</span>
          <input type="text" inputmode="decimal" name="jpy" value="10000" aria-label="Amount in Japanese yen">
        </label>
        <div class="fx-results">
          <p><span>USD</span><strong data-out="usd">$63.30</strong></p>
          <p><span>NIS</span><strong data-out="ils">195.57</strong></p>
        </div>
        <small>Approximate mock · 16 Oct 2026 · not a live rate</small>
      </form>
    </section>`,
    notes: 'An audience-of-one utility. Type a yen amount; USD and NIS update from static mid-October 2026 rates (about 158 JPY per USD, 100 JPY = ₪1.9557). No live FX call.'
  },
  {
    id: 'part1-16-car-appraiser',
    duration: 2,
    title: 'Car Appraiser Finder',
    className: 'slide-project utility car-appraiser',
    html: `<section class="life-tool life-tool--map" data-interaction="car-map">
      <div class="life-tool__copy">
        <h2 data-depth="1">Car Appraiser Finder</h2>
        <aside class="drive-card">
          <p data-drive-copy>Tap a pin</p>
          <strong data-drive-time></strong>
          <small>approx. drive from Ramat Hasharon</small>
        </aside>
      </div>
      <div class="tlv-stage">
        <svg class="tlv-map" viewBox="0 0 860 520" role="img" aria-label="Stylized map of Tel Aviv and Ramat Hasharon">
          <rect width="860" height="520" fill="#12181f"/>
          <path d="M0 0 H230 C200 70 260 130 210 190 C165 250 235 300 195 360 C160 415 220 460 180 520 H0 Z" fill="#16384a"/>
          <path d="M250 20 C230 110 285 175 235 245 C195 315 255 380 215 510" fill="none" stroke="#f6f0e422" stroke-width="5"/>
          <path d="M505 24 V508" fill="none" stroke="#f6f0e433" stroke-width="7"/>
          <path d="M850 168 C680 148 540 196 390 176 C300 164 245 150 205 172" fill="none" stroke="#42e8e0" stroke-width="7" stroke-linecap="round"/>
          <g fill="#ffffff12">
            <rect x="280" y="210" width="36" height="22" rx="2"/><rect x="324" y="210" width="36" height="22" rx="2"/><rect x="368" y="210" width="36" height="22" rx="2"/>
            <rect x="280" y="240" width="36" height="22" rx="2"/><rect x="324" y="240" width="36" height="22" rx="2"/><rect x="368" y="240" width="36" height="22" rx="2"/>
            <rect x="300" y="300" width="40" height="24" rx="2"/><rect x="348" y="300" width="40" height="24" rx="2"/><rect x="396" y="300" width="40" height="24" rx="2"/>
            <rect x="300" y="332" width="40" height="24" rx="2"/><rect x="348" y="332" width="40" height="24" rx="2"/><rect x="396" y="332" width="40" height="24" rx="2"/>
            <rect x="320" y="390" width="34" height="20" rx="2"/><rect x="360" y="390" width="34" height="20" rx="2"/><rect x="330" y="416" width="34" height="20" rx="2"/>
          </g>
          <text x="28" y="250" fill="#7eb8cc" font-size="15" font-family="Inter,sans-serif" transform="rotate(-90 28 250)">Mediterranean</text>
          <text x="430" y="58" fill="#c9ff4a" font-size="16" font-family="Inter,sans-serif" font-weight="700">Ramat Hasharon</text>
          <circle cx="400" cy="78" r="7" fill="#c9ff4a" stroke="#09090b" stroke-width="2"/>
          <text x="620" y="150" fill="#42e8e0" font-size="13" font-family="Inter,sans-serif">Yarkon</text>
          <text x="560" y="250" fill="#d8d0dc" font-size="13" font-family="Inter,sans-serif">Ramat Gan</text>
          <text x="520" y="500" fill="#aaa3ae" font-size="12" font-family="Inter,sans-serif">Ayalon</text>
        </svg>
        <button type="button" class="appraiser-pin" style="left:34.88%;top:27.88%" data-place="Glilot" data-minutes="8" aria-label="Glilot, about 8 minutes from Ramat Hasharon"><span class="appraiser-pin__dot"></span><span class="appraiser-pin__name">Glilot</span></button>
        <button type="button" class="appraiser-pin" style="left:41.86%;top:44.23%" data-place="Ramat Aviv" data-minutes="12" aria-label="Ramat Aviv, about 12 minutes from Ramat Hasharon"><span class="appraiser-pin__dot"></span><span class="appraiser-pin__name">Ramat Aviv</span></button>
        <button type="button" class="appraiser-pin" style="left:29.07%;top:48.08%" data-place="Namal Tel Aviv" data-minutes="15" aria-label="Namal Tel Aviv, about 15 minutes from Ramat Hasharon"><span class="appraiser-pin__dot"></span><span class="appraiser-pin__name">Namal</span></button>
        <button type="button" class="appraiser-pin" style="left:46.51%;top:59.62%" data-place="Dizengoff Center" data-minutes="20" aria-label="Dizengoff Center, about 20 minutes from Ramat Hasharon"><span class="appraiser-pin__dot"></span><span class="appraiser-pin__name">Dizengoff</span></button>
        <button type="button" class="appraiser-pin" style="left:72.09%;top:51.92%" data-place="Ramat Gan Bursa" data-minutes="18" aria-label="Ramat Gan Bursa, about 18 minutes from Ramat Hasharon"><span class="appraiser-pin__dot"></span><span class="appraiser-pin__name">Bursa</span></button>
        <button type="button" class="appraiser-pin" style="left:43.02%;top:76.92%" data-place="Florentin" data-minutes="28" aria-label="Florentin, about 28 minutes from Ramat Hasharon"><span class="appraiser-pin__dot"></span><span class="appraiser-pin__name">Florentin</span></button>
        <button type="button" class="appraiser-pin" style="left:26.74%;top:78.85%" data-place="Jaffa Port" data-minutes="34" aria-label="Jaffa Port, about 34 minutes from Ramat Hasharon"><span class="appraiser-pin__dot"></span><span class="appraiser-pin__name">Jaffa</span></button>
      </div>
    </section>`,
    notes: 'Another tiny tool for a specific personal need. Stylized offline map of Tel Aviv. Click a pin for a mock drive time from Ramat Hasharon — plausible minutes, not a routing API.'
  },
  {
    id: 'part1-17-show-tracker',
    duration: 2,
    title: 'Show tracker',
    className: 'slide-project utility show-tracker',
    html: `<section class="life-tool life-tool--shows" data-interaction="show-tracker">
      <header class="show-tracker__head">
        <h2>Show tracker</h2>
        <p>click = seen · drag between lists</p>
      </header>
      <div class="show-board">
        <div class="show-list" data-list="watching">
          <h3>Watching</h3>
          <div class="show-list__stack">
            <article class="show-card" draggable="true" tabindex="0" data-show="stuart" aria-pressed="false">
              <img src="./assets/projects/show-stuart-fails.jpg" alt="" draggable="false">
              <span class="show-card__title">Stuart Fails to Save the Universe</span>
              <i class="show-card__check" aria-hidden="true">✓</i>
            </article>
            <article class="show-card" draggable="true" tabindex="0" data-show="lasso" aria-pressed="false">
              <img src="./assets/projects/show-ted-lasso.jpg" alt="" draggable="false">
              <span class="show-card__title">Ted Lasso</span>
              <i class="show-card__check" aria-hidden="true">✓</i>
            </article>
            <article class="show-card" draggable="true" tabindex="0" data-show="snw" aria-pressed="false">
              <img src="./assets/projects/show-strange-new-worlds.jpg" alt="" draggable="false">
              <span class="show-card__title">Star Trek: Strange New Worlds</span>
              <i class="show-card__check" aria-hidden="true">✓</i>
            </article>
          </div>
        </div>
        <div class="show-list" data-list="check">
          <h3>Need to check</h3>
          <div class="show-list__stack">
            <article class="show-card" draggable="true" tabindex="0" data-show="vision" aria-pressed="false">
              <img src="./assets/projects/show-visionquest.jpg" alt="" draggable="false">
              <span class="show-card__title">VisionQuest</span>
              <i class="show-card__check" aria-hidden="true">✓</i>
            </article>
            <article class="show-card" draggable="true" tabindex="0" data-show="adults" aria-pressed="false">
              <img src="./assets/projects/show-adults-s2.jpg" alt="" draggable="false">
              <span class="show-card__title">Adults · season 2</span>
              <i class="show-card__check" aria-hidden="true">✓</i>
            </article>
          </div>
        </div>
      </div>
    </section>`,
    notes: 'A tracker because the existing trackers were not mine. Click a card to mark it seen (strike + check). Drag a card into the other list. Posters are local copies. The real title for the Stuart show is Stuart Fails to Save the Universe (Big Bang Theory spinoff), not “Stuart Saves the Universe.”'
  },
  {
    id: 'part1-18-feed-the-feed',
    duration: 3,
    title: 'Feed The Feed',
    className: 'slide-project feed-the-feed',
    html: `<section class="project-feature project-feature--dashboard" data-interaction="reveal-port-note"><div class="project-image" data-depth="2">${asset('projects/feed-the-feed.png', 'Feed The Feed studio')}</div><h2 data-depth="1">Feed The Feed</h2><button type="button" class="port-note" data-action="reveal-port">Three.js port?</button></section>`,
    notes: 'A Horizon project, then another project to port it.'
  },
  {
    id: 'part1-19-camsport',
    duration: 2,
    title: 'CamSport',
    className: 'slide-project camsport',
    html: `<section class="project-feature project-feature--sports" data-interaction="ball-arc"><div class="project-image" data-depth="2">${asset('projects/camsport.png', 'CamSport')}</div><h2 data-depth="1">CamSport</h2><button type="button" class="ball" data-action="ball-arc" aria-label="Control ball arc">●</button></section>`,
    notes: 'One short sentence from the local project during build.'
  },
  {
    id: 'part1-20-kaiju-qa',
    duration: 2,
    title: 'Kaiju QA',
    className: 'slide-project kaiju-qa',
    html: `<section class="kaiju-scene" data-interaction="stamp-pass"><div class="kaiju-art" data-depth="2">${asset('projects/kaiju-qa.png', 'Kaiju QA')}</div><h2 data-depth="1">Kaiju QA</h2><button type="button" class="pass-stamp" data-action="stamp-pass">PASS</button></section>`,
    notes: 'Built in three days for OpenAI Build Week.'
  },
  {
    id: 'part1-21-improv-dashboard',
    duration: 3,
    title: 'Improv Dashboard',
    className: 'slide-project improv-dashboard',
    html: `<section class="project-feature project-feature--toolbox" data-interaction="spin-prompt"><div class="project-image" data-depth="2">${asset('projects/improv-dashboard.png', 'Improv Dashboard')}</div><h2 data-depth="1">Improv Dashboard</h2><button type="button" class="prompt-wheel" data-action="spin-prompt" aria-label="Spin prompt wheel">?</button></section>`,
    notes: 'A toolkit for rehearsals, classes, and shows.'
  },
  {
    id: 'part1-22-improv-calendar',
    duration: 3,
    title: 'Improv Calendar',
    className: 'slide-project improv-calendar',
    html: `<section class="project-feature project-feature--calendar" data-interaction="expand-events"><div class="project-image" data-depth="2">${asset('projects/improv-calendar.png', 'Improv Calendar')}</div><h2 data-depth="1">Improv Calendar</h2><button type="button" class="event-card" data-action="expand-events">events</button></section>`,
    notes: 'The Israeli improv calendar—because finding shows was itself a problem.'
  },
  {
    id: 'part1-23-lovelink',
    duration: 3,
    title: 'LoveLink',
    className: 'slide-project lovelink',
    html: `<section class="project-feature project-feature--ui" data-interaction="float-ui"><div class="project-image" data-depth="2">${asset('projects/lovelink.jpg', 'LoveLink project')}</div><h2 data-depth="1">LoveLink</h2><div class="commit-ticker" data-depth="3">commit · commit · commit</div></section>`,
    notes: 'Relationship/love progression game and app.'
  },
  {
    id: 'part1-24-jigtrade',
    duration: 2,
    title: 'JigTrade',
    className: 'slide-project jigtrade',
    html: `<section class="project-feature project-feature--puzzle" data-interaction="swap-tiles"><div class="project-image" data-depth="2">${asset('projects/jigtrade.png', 'JigTrade project')}</div><h2 data-depth="1">JigTrade</h2>${hotspot('Swap tiles', 'data-action="swap-tiles"')}</section>`,
    notes: 'A puzzle collecting, trading, and battle system.'
  },
  {
    id: 'part1-25-glasses',
    duration: 3,
    title: 'Where Are My Glasses?',
    className: 'slide-project glasses',
    html: `<section class="project-feature project-feature--focus" data-interaction="rack-focus"><div class="project-image" data-depth="2">${asset('projects/where-are-my-glasses.jpg', 'Where Are My Glasses project')}</div><h2 data-depth="1">Where Are My Glasses?</h2>${hotspot('Rack focus', 'data-action="rack-focus"')}</section>`,
    notes: 'Mixed-reality comedy about neurodivergence.'
  },
  {
    id: 'part1-26-meditation',
    duration: 3,
    title: 'Meditation: EXTREME!!!1',
    className: 'slide-project meditation',
    html: `<section class="project-feature project-feature--contrast" data-interaction="shake-reduced-motion"><div class="project-image" data-depth="2">${asset('projects/meditation-extreme.jpg', 'Meditation Extreme project')}</div><h2 data-depth="1">Meditation: EXTREME!!!1</h2>${hotspot('Calm / chaos', 'data-action="toggle-chaos"')}</section>`,
    notes: 'Meditation as an extreme comedy sport. Shake stops in reduced-motion mode.'
  },
  {
    id: 'part1-27-save-point',
    duration: 3,
    title: 'Save Point',
    className: 'slide-project save-point',
    html: `<section class="project-feature project-feature--game" data-interaction="multiply-windows"><div class="project-image" data-depth="1"><video src="./assets/projects/save-point.webm" autoplay muted loop playsinline preload="auto" aria-label="Save Point gameplay"></video></div><h2 data-depth="2">Save Point</h2><div class="tiny-windows" data-depth="3"><span>narrative</span><span>web</span><span>build</span></div></section>`,
    notes: 'A narrative game—and the project behind the expensive lesson later. Placed last in the spotlight run so the $12k story has an image still fresh.'
  },
  {
    id: 'part1-27b-misc-projects',
    duration: 4,
    title: 'Misc. projects',
    className: 'slide-misc-projects',
    html: (() => {
      const frames = [
        { label: 'Improv troupe', image: 'misc/improv-troupe.jpg', position: 'center 42%' },
        { label: 'Server maintenance', image: 'misc/server-maintenance.jpg', position: 'center center' },
        { label: 'AI research', image: 'misc/ai-research.jpg', position: '58% center' },
        { label: 'Organize events', image: 'misc/organize-events.jpg', position: 'center 46%' },
      ];
      const frame = (item, index) => `
        <figure class="film-frame" data-depth="${(index % 3) + 1}">
          <div class="film-cell">
            <div class="film-sprockets" aria-hidden="true"></div>
            <div class="film-gate">
              <img src="./assets/${item.image}" alt="${item.label}" style="object-position:${item.position}" loading="eager">
            </div>
            <div class="film-sprockets" aria-hidden="true"></div>
            <span class="film-index" aria-hidden="true">${String(index + 1).padStart(2, '0')}</span>
          </div>
          <figcaption>${item.label}</figcaption>
        </figure>`;
      return `<section class="misc-projects" aria-labelledby="misc-projects-title"><h2 id="misc-projects-title" data-depth="1">Misc. projects</h2><div class="film-strip">${frames.map(frame).join('')}</div></section>`;
    })(),
    notes: 'Side work that is not a shipped product: the improv troupe, server maintenance, AI research, and organizing events.'
  },
  {
    id: 'part1-27c-task-swipe',
    duration: 3,
    title: 'Task Swipe',
    className: 'slide--task-swipe-later',
    html: `
      <section class="task-swipe-placeholder" aria-labelledby="task-swipe-title">
        <h2 id="task-swipe-title" data-depth="1">Task Swipe</h2>
        <figure class="task-swipe-shot" data-depth="2">
          <img src="./assets/projects/taskswipe-mockup.png" alt="TaskSwipe" loading="eager">
        </figure>
        <p class="task-swipe-later" data-depth="3">Demo later</p>
      </section>`,
    notes: 'Placeholder. The swipe demo is later in the deck.'
  },
  {
    id: 'part1-27d-this-talk',
    duration: 4,
    title: '#19 — This talk.',
    className: 'slide--this-talk',
    html: `
      <section class="this-talk" aria-labelledby="this-talk-title">
        <h2 id="this-talk-title" data-depth="1">#19 — This talk.</h2>
        <div class="talk-mini-frame" data-depth="2">
          <div class="talk-mini-scale">
            <section class="hero-grid" aria-label="Opening slide">
              <h1 data-depth="1">Everything Everywhere<br><em>All at Once</em></h1>
              <p data-depth="2">how to work on 19 projects simultaneously</p>
              <div class="project-grid" data-depth="3">
                ${cards([
                  { label: 'LoveLink', image: 'projects/lovelink.jpg' },
                  { label: 'Save Point', image: 'projects/save-point.webm' },
                  { label: 'Where Are My Glasses?', image: 'projects/where-are-my-glasses.jpg' },
                  { label: 'Meditation: EXTREME!!!1', image: 'projects/meditation-extreme.jpg' },
                  { label: 'Feed The Feed', image: 'projects/feed-the-feed.png' },
                  { label: 'JigTrade', image: 'projects/jigtrade.png' },
                  { label: 'Improv Dashboard', image: 'projects/improv-dashboard.png' },
                  { label: 'CamSport', image: 'projects/camsport.png' },
                ])}
              </div>
              <span class="hotspot">Tilt the grid</span>
            </section>
          </div>
        </div>
      </section>`,
    notes: 'Project nineteen is this talk. The frame is the opening slide, scaled down.'
  },
  {
    id: 'part1-28-hackathons-funds-talks',
    duration: 5,
    title: 'Hackathons. Funds. Talks.',
    className: 'slide-slot-machine',
    html: (() => {
      // One image per project — deduped paths from public/assets (no placeholders / -raw).
      const slotSymbols = [
        { label: 'Corbomite', image: 'history/corbomite-logo.jpg' },
        { label: 'Zbang', image: 'history/zbang-banner.jpg' },
        { label: 'Pizza Morgana', image: 'history/pizza-morgana-banner.jpg' },
        { label: 'Star Shipping', image: 'history/star-shipping-banner.jpg' },
        { label: 'Spinning Cube', image: 'history/spinning-cube-logo.png' },
        { label: 'Bolt Riley', image: 'history/bolt-riley-intro.jpg' },
        { label: "Herbert's Quest", image: 'history/herberts-quest.jpg' },
        { label: 'Uniform', image: 'history/uniform-logo.jpg' },
        { label: 'Avner', image: 'history/avner-itch.jpg' },
        { label: 'Kisa', image: 'history/kisa-logo.png' },
        { label: 'Heavenly Hell', image: 'history/heavenly-hell-logo.png' },
        { label: 'Oh SHIP!', image: 'history/oh-ship-trailer.jpg' },
        { label: 'BRCvr', image: 'history/brcvr-playa.jpg' },
        { label: 'Adventure Mob', image: 'history/adventure-mob-logo.jpg' },
        { label: 'Star Mates', image: 'history/star-mates-gdc.jpg' },
        { label: 'LoveLink', image: 'projects/lovelink.jpg' },
        { label: 'Save Point', image: 'projects/save-point-itch.jpg' },
        { label: 'Glasses', image: 'projects/where-are-my-glasses-cover.png' },
        { label: 'Meditation', image: 'projects/meditation-extreme.jpg' },
        { label: 'Kaiju QA', image: 'projects/kaiju-qa-hero.png' },
        { label: 'Improv Dash', image: 'projects/improv-dashboard.png' },
        { label: 'Improv Cal', image: 'projects/improv-calendar.png' },
        { label: 'Feed The Feed', image: 'projects/feed-the-feed.png' },
        { label: 'JigTrade', image: 'projects/jigtrade.png' },
        { label: 'CamSport', image: 'projects/camsport.png' },
        { label: 'Good Measure', image: 'slot/good-measure-itch.jpg' },
        { label: 'Tricky Potions', image: 'slot/tricky-potions-itch.jpg' },
        { label: 'Freedom Beats', image: 'slot/freedom-beats-itch.jpg' },
        { label: 'Turn Me On', image: 'slot/turn-me-on-itch.jpg' },
        { label: 'Steam Engine', image: 'sidequests/geekcon-steam-engine.jpg' },
        { label: 'Imperial March', image: 'sidequests/imperial-march-hdd.jpg' },
        { label: 'Burner', image: 'about/oded-burner.jpg' },
        { label: 'Maker', image: 'about/oded-maker.jpg' },
        { label: 'Sculpture', image: 'about/burning-man-sculpture.jpg' },
      ];
      // Dedupe by image path (keep first label).
      const seen = new Set();
      const unique = slotSymbols.filter((item) => {
        if (seen.has(item.image)) return false;
        seen.add(item.image);
        return true;
      });
      const tile = (item) => `
        <div class="slot-tile" data-project="${item.label}">
          <img src="./assets/${item.image}" alt="${item.label}" loading="eager" draggable="false">
          <span>${item.label}</span>
        </div>`;
      // Deterministic shuffle so each reel cycles a different order.
      const shuffle = (list, salt) => {
        const copy = [...list];
        for (let i = copy.length - 1; i > 0; i -= 1) {
          const j = Math.abs((i * 17 + salt * 31) % (i + 1));
          [copy[i], copy[j]] = [copy[j], copy[i]];
        }
        return copy;
      };
      const reels = [0, 1, 2].map((reelIndex) => {
        const order = shuffle(unique, reelIndex + 1);
        // Triple the strip so continuous translateY scroll never runs out of tiles mid-spin.
        const strip = [...order, ...order, ...order].map(tile).join('');
        return `<div class="slot-reel" data-reel="${reelIndex}" data-symbols="${order.length}"><div class="slot-reel__strip">${strip}</div></div>`;
      }).join('');
      return `<section class="slot-machine" data-interaction="drag-lever"><h2 data-depth="1">Hackathons.<br>Funds.<br>Talks.</h2><div class="slot-stage" data-depth="2"><div class="slot-window"><div class="slot-reels">${reels}</div></div><button type="button" class="slot-lever" data-action="pull-slot" aria-label="Pull slot lever">pull</button></div></section>`;
    })(),
    notes: 'The software projects generate applications, talks, demos, and deadlines. No private names.'
  },
  {
    id: 'part1-29-the-cut',
    duration: 20,
    title: 'The Cut.',
    className: 'slide-the-cut',
    html: (() => {
      const names = [
        'LoveLink', 'Save Point', 'Glasses', 'Meditation', 'Feed The Feed', 'JigTrade', 'Improv',
        'CamSport', 'Kaiju QA', 'TaskSwipe', 'Currency', 'Servers', 'Music', 'Submissions', 'Symphony', 'Planning', 'Calendar', 'Talks', 'This deck',
      ];
      const aboveLabels = ['Improv', 'Submissions'];
      const above = aboveLabels.filter((label) => names.includes(label));
      const below = names.filter((label) => !aboveLabels.includes(label));
      const chip = (label) => `<button type="button" class="cut-name" data-project="${label}">${label}</button>`;
      return `
      <section class="the-cut" data-interaction="the-cut" aria-labelledby="the-cut-title">
        <header class="the-cut__head">
          <h2 id="the-cut-title">The Cut.</h2>
          <p class="the-cut__count" data-cut-count>${above.length} this week</p>
        </header>
        <div class="the-cut__above" data-cut-zone="above" aria-label="This week">${above.map(chip).join('')}</div>
        <div class="the-cut__line" role="separator" aria-hidden="true"><span>the cut</span></div>
        <p class="the-cut__later">not this week — drag a name through the line</p>
        <div class="the-cut__below" data-cut-zone="below" aria-label="Not this week">${below.map(chip).join('')}</div>
        <p class="sr-only">Improv and Submissions start above the cut. Drag another name up. Seven fit; an eighth drops one below.</p>
      </section>`;
    })(),
    notes: 'The cut starts with Improv and Submissions above the line. Drag more names up — seven fit, and an eighth pushes one back down. Everything else starts below. Transition: “So—how?”'
  }
];

