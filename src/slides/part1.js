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

/** Image bubbles left of the 2026 smash bar (lines point at that column). */
const chart2026Callouts = [
  { label: 'LoveLink', image: 'projects/lovelink.jpg', y: 16 },
  { label: 'Save Point', image: 'projects/save-point-itch.jpg', y: 32 },
  { label: 'Improv Dashboard', image: 'projects/improv-dashboard.png', y: 48 },
  { label: 'TaskSwipe', image: 'projects/taskswipe-placeholder.png', y: 64 },
  { label: 'Kaiju QA', image: 'projects/kaiju-qa.png', y: 80 },
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
        <figure class="year-project-pin pin-${pin.year}" data-draggable="true" data-year="${pin.year}">
          <img src="./assets/${pin.image}" alt="" draggable="false">
          <figcaption>${pin.label}</figcaption>
          <i class="year-project-pin__stem" aria-hidden="true"></i>
        </figure>` : ''}
    </div>`;
    }).join('');
  return `<div class="year-project-pins" aria-hidden="true">${slots}</div>`;
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
    ${highlightYear === 2026 ? `
      <div class="chart-callouts" aria-label="Projects in the AI Agents year">
        ${chart2026Callouts.map((item) => `
          <div class="chart-callout" style="--callout-y:${item.y}%" data-draggable="true">
            <figure class="chart-callout__bubble">
              <img src="./assets/${item.image}" alt="" draggable="false">
              <figcaption>${item.label}</figcaption>
            </figure>
            <i class="chart-callout__line" aria-hidden="true"></i>
          </div>`).join('')}
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
        <div class="orbit-photo orbit-photo--main" data-depth="1">${asset('about/oded-maker.jpg', 'Oded making something')}</div>
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
    html: `<section class="scrapbook-collage collage--logos" data-interaction="snap-collage"><h2 class="sr-only">Adventure games</h2>${cards([
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
    html: `<section class="platform-collage collage--logos" data-interaction="snap-collage"><h2 class="sr-only">Different platforms</h2>${cards([
      { label: 'Star Shipping', image: 'history/star-shipping-logo.png' },
      { label: 'Spinning Cube', image: 'history/spinning-cube-logo.png' },
      { label: "Larry demo", image: 'history/larry-demo-placeholder.png' },
      { label: "Gun N' Blade", image: 'history/gun-n-blade-placeholder.png' },
    ])}</section>`,
    notes: 'Star Shipping + Spinning Cube logos from Corbomite. Larry demo and Gun N’ Blade still need your captures.'
  },
  {
    id: 'part1-06-adventure-publishing',
    duration: 2,
    title: 'Adventure games and publishing',
    className: 'slide-collage publishing',
    html: `<section class="publishing-collage collage--logos" data-interaction="snap-collage"><h2 class="sr-only">Adventure games and publishing</h2>${cards([
      { label: 'Bolt Riley', image: 'history/bolt-riley-intro.jpg' },
      { label: 'Avner', image: 'history/avner-icon.jpg' },
      { label: "Herbert's Quest", image: 'history/herberts-quest.jpg' },
      { label: 'Uniform', image: 'history/uniform-logo.jpg' },
    ])}</section>`,
    notes: 'Bolt Riley, Avner, Herbert’s Quest, Uniform (replaced Nightmare Playground).'
  },
  {
    id: 'part1-07-community',
    duration: 2,
    title: 'Organize, teach, speak, jam',
    className: 'slide-collage community',
    html: `<section class="community-collage" data-interaction="snap-collage"><h2 class="sr-only">Community</h2>${cards([
      { label: 'GDC stages', image: 'community/gdc-stages-placeholder.png' },
      { label: 'Game Dev Day', image: 'community/game-dev-day-placeholder.png' },
      { label: 'GGJ groups', image: 'community/ggj-groups-placeholder.png' },
      { label: 'Teaching', image: 'community/teaching-placeholder.png' },
    ])}</section>`,
    notes: 'I also organized, taught, spoke, and jammed.'
  },
  {
    id: 'part1-08-xr',
    duration: 2,
    title: 'XR added more worlds',
    className: 'slide-collage xr',
    html: `<section class="xr-collage collage--logos" data-interaction="snap-collage"><h2 class="sr-only">XR worlds</h2>${cards([
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
    html: `<section class="sidequest-collage" data-interaction="snap-collage"><h2 class="sr-only">Side quests</h2>${cards([
      { label: 'Geekcon', image: 'sidequests/geekcon-steam-engine.jpg' },
      { label: 'Midburn pyro', image: 'about/burning-man-sculpture.jpg' },
      { label: 'Fireworks', image: 'about/fireworks.jpg' },
      { label: 'Imperial March', image: 'sidequests/imperial-march-hdd.jpg' },
    ])}</section>`,
    notes: 'Geekcon steam engine; Midburn pyro (was mislabeled Burning Man); fireworks; Imperial March HDD (YouTube: “yet another hard drive playing Imperial March”).'
  },
  {
    id: 'part1-10-twenty-years',
    duration: 5,
    title: '20 years.',
    className: 'slide-mosaic-collapse',
    html: `<section class="mosaic-collapse" data-interaction="pull-tiles"><h2 data-depth="1">20 years.</h2><div class="tiny-mosaic" data-depth="3">${cards([
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
    notes: 'Keep the same chart and smash the 2026 bar past the frame: thirty-six active projects. Exact count can stay in the phase pill; the smash is the beat.'
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
    id: 'part1-15-currency',
    duration: 2,
    title: 'Currency converter',
    className: 'slide-project utility currency',
    html: `<section class="utility-phone" data-interaction="split-recombine"><div class="phone-shell" data-depth="2">${asset('projects/currency-converter-placeholder.png', 'NEED IMAGE Of CURRENCY CONVERTER HERE')}</div><h2 data-depth="1">Currency converter</h2></section>`,
    notes: 'An audience-of-one utility. Start the spotlight run with the smallest life tools.'
  },
  {
    id: 'part1-16-car-appraiser',
    duration: 2,
    title: 'Car Appraiser Finder',
    className: 'slide-project utility car-appraiser',
    html: `<section class="utility-phone" data-interaction="fan-cards"><div class="phone-shell phone-shell--map" data-depth="2">${asset('projects/car-appraiser-placeholder.png', 'NEED IMAGE Of CAR APPRAISER FINDER HERE')}</div><h2 data-depth="1">Car Appraiser Finder</h2></section>`,
    notes: 'Another tiny tool for a specific personal need.'
  },
  {
    id: 'part1-17-show-tracker',
    duration: 2,
    title: 'Show tracker',
    className: 'slide-project utility show-tracker',
    html: `<section class="stacked-phone-cards" data-interaction="stack-cards"><div class="phone-shell" data-depth="2">${asset('projects/show-tracker-placeholder.png', 'NEED IMAGE Of SHOW TRACKER HERE')}</div><h2>Show tracker</h2></section>`,
    notes: 'A tracker because the existing trackers were not mine.'
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
    id: 'part1-28-hackathons-funds-talks',
    duration: 5,
    title: 'Hackathons. Funds. Talks.',
    className: 'slide-slot-machine',
    html: (() => {
      const slotSymbols = [
        { label: 'Kaiju QA', image: 'projects/kaiju-qa-hero.png' },
        { label: 'Save Point', image: 'projects/save-point-itch.jpg' },
        { label: 'Good Measure', image: 'slot/good-measure-itch.jpg' },
        { label: 'Oh SHIP!', image: 'history/oh-ship-trailer.jpg' },
        { label: 'Tricky Potions', image: 'slot/tricky-potions-itch.jpg' },
        { label: 'Freedom Beats', image: 'slot/freedom-beats-itch.jpg' },
      ];
      const tile = (item) => `
        <div class="slot-tile" data-project="${item.label}">
          ${asset(item.image, item.label)}
          <span>${item.label}</span>
        </div>`;
      // Three columns; each reel gets a rotated order so reels look distinct at rest.
      const reels = [0, 1, 2].map((reelIndex) => {
        const order = [...slotSymbols.slice(reelIndex), ...slotSymbols.slice(0, reelIndex)];
        const strip = [...order, ...order].map(tile).join('');
        return `<div class="slot-reel" data-reel="${reelIndex}" data-symbols="${order.length}"><div class="slot-reel__strip">${strip}</div></div>`;
      }).join('');
      return `<section class="slot-machine" data-interaction="drag-lever"><h2 data-depth="1">Hackathons.<br>Funds.<br>Talks.</h2><div class="slot-window" data-depth="2"><div class="slot-reels">${reels}</div></div><button type="button" class="slot-lever" data-action="pull-slot" aria-label="Pull slot lever">pull</button></section>`;
    })(),
    notes: 'The software projects generate applications, talks, demos, and deadlines. No private names.'
  },
  {
    id: 'part1-29-all-at-once',
    duration: 8,
    title: 'All at once.',
    className: 'slide-swimlane',
    html: `<section class="swimlane-wall" data-interaction="reorder-lanes"><h2 data-depth="1">All at once.</h2><div class="swimlanes swimlanes--chaos" data-depth="2">${[
      'LoveLink', 'Save Point', 'Glasses', 'Meditation', 'Feed The Feed', 'JigTrade', 'Improv', 'CamSport', 'Kaiju QA',
      'TaskSwipe', 'Currency', 'Servers', 'Music', 'Submissions', 'Symphony', 'Planning', 'Calendar', 'Talks', 'This deck'
    ].map((label, index) => `<button type="button" class="swimlane swimlane--${index + 1}" data-lane="${label}" data-depth="${index % 3 + 1}" style="--width:${55 + ((index * 17) % 40)}%"><span>${label}</span></button>`).join('')}</div>${hotspot('Reorder lanes', 'data-action="reorder-lanes"')}</section>`,
    notes: 'Nineteen concurrent lanes — games, life tools, servers, music uploads, submissions, talks, planning. Drag to prove it is not a static animation. Transition: “So—how?”'
  }
];

