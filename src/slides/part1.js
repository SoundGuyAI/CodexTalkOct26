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
  [2018, 13], [2019, 4], [2020, 9], [2021, 6], [2022, 9], [2023, 14],
  [2024, 6], [2025, 18], [2026, 36],
];

const yearlyProjectBars = (throughYear, highlightYear = null) => yearlyProjects
  .filter(([year]) => year <= throughYear)
  .map(([year, count]) => `
  <button
    type="button"
    class="year-bar${year === highlightYear ? ' is-current' : ''}"
    style="--bar-height:${Math.max(11, (count / 36) * 100)}%"
    aria-label="${year}: ${count} projects"
    title="${year}: ${count} projects"
  >
    <strong class="year-total">${count}</strong>
    <span class="year-label">${year}</span>
  </button>`).join('');

const yearlyProjectPins = (throughYear) => `
  <div class="year-project-pins" aria-hidden="true">
    <figure class="year-project-pin pin-2009" data-depth="2"><img src="./assets/history/bolt-riley.jpg" alt=""><figcaption>Bolt Riley</figcaption></figure>
    <figure class="year-project-pin pin-2018" data-depth="3"><img src="./assets/history/brcvr-playa.jpg" alt=""><figcaption>XR + maker years</figcaption></figure>
    ${throughYear >= 2025 ? '<figure class="year-project-pin pin-2025" data-depth="2"><img src="./assets/projects/lovelink.jpg" alt=""><figcaption>LoveLink</figcaption></figure>' : ''}
    ${throughYear >= 2026 ? '<figure class="year-project-pin pin-2026" data-depth="2"><img src="./assets/projects/kaiju-qa.png" alt=""><figcaption>agent era</figcaption></figure>' : ''}
  </div>`;

const yearlyChart = ({ throughYear, highlightYear = null, phase }) => `
  <section class="yearly-chart" data-interaction="year-bars">
    <header class="yearly-chart__heading">
      <p>How many things was I actively working on?</p>
      <h2>Projects / year</h2>
    </header>
    ${phase ? `<div class="yearly-chart__phase">${phase}</div>` : ''}
    <div class="year-bars" role="img" aria-label="Projects active in each year from 2006 to ${throughYear}">
      ${yearlyProjectBars(throughYear, highlightYear)}
    </div>
    ${yearlyProjectPins(throughYear)}
    <p class="yearly-chart__hint">hover a bar for the year and total</p>
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
        ${hotspot('Tilt the multiverse', 'data-action="tilt"')}
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
        ${hotspot('Pause the orbit', 'data-action="pause-orbit"')}
      </section>`,
    notes: 'Thirty years making games. Indie developer, XR creator, improviser, ADHD.'
  },
  {
    id: 'part1-04-adventure-games',
    duration: 2,
    title: 'Adventure games',
    className: 'slide-collage scrapbook',
    html: `<section class="scrapbook-collage" data-interaction="snap-collage"><h2 class="sr-only">Adventure games</h2>${cards([
      { label: 'Zbang', image: 'history/adventure-mob-logo.jpg' },
      { label: 'Pizza Morgana', image: 'projects/where-are-my-glasses.jpg' },
      { label: 'Knights', image: 'history/bolt-riley.jpg' },
      { label: 'Rock Band', image: 'about/fireworks.jpg' },
    ])}</section>`,
    notes: 'Fast chronology. No project descriptions.'
  },
  {
    id: 'part1-05-platforms',
    duration: 2,
    title: 'Different platforms',
    className: 'slide-collage platforms',
    html: `<section class="platform-collage" data-interaction="snap-collage"><h2 class="sr-only">Different platforms</h2>${cards([
      { label: 'Star Shipping', image: 'projects/camsport.png' },
      { label: 'Spinning Cube', image: 'projects/jigtrade.png' },
      { label: "Larry demo", image: 'projects/kaiju-qa.png' },
      { label: "Gun N' Blade", image: 'projects/save-point.webm' },
    ])}</section>`,
    notes: 'Different platforms, same small team.'
  },
  {
    id: 'part1-06-adventure-publishing',
    duration: 2,
    title: 'Adventure games and publishing',
    className: 'slide-collage publishing',
    html: `<section class="publishing-collage" data-interaction="snap-collage"><h2 class="sr-only">Adventure games and publishing</h2>${cards([
      { label: 'Bolt Riley', image: 'history/bolt-riley.jpg' },
      { label: 'Avner', image: 'projects/meditation-extreme.jpg' },
      { label: "Herbert's Quest", image: 'projects/where-are-my-glasses.jpg' },
      { label: 'Nightmare Playground', image: 'projects/kaiju-qa.png' },
    ])}</section>`,
    notes: 'Years of adventure games and publishing.'
  },
  {
    id: 'part1-07-community',
    duration: 2,
    title: 'Organize, teach, speak, jam',
    className: 'slide-collage community',
    html: `<section class="community-collage" data-interaction="snap-collage"><h2 class="sr-only">Community</h2>${cards([
      { label: 'GDC stages', image: 'about/oded-maker.jpg' },
      { label: 'Game Dev Day', image: 'about/oded-burner.jpg' },
      { label: 'GGJ groups', image: 'about/fireworks.jpg' },
      { label: 'Teaching', image: 'about/burning-man-sculpture.jpg' },
    ])}</section>`,
    notes: 'I also organized, taught, spoke, and jammed.'
  },
  {
    id: 'part1-08-xr',
    duration: 2,
    title: 'XR added more worlds',
    className: 'slide-collage xr',
    html: `<section class="xr-collage" data-interaction="snap-collage"><h2 class="sr-only">XR worlds</h2>${cards([
      { label: 'Star Mates', image: 'projects/where-are-my-glasses.jpg' },
      { label: 'BRCvr', image: 'history/brcvr-playa.jpg' },
      { label: 'Oh SHIP!', image: 'projects/camsport.png' },
      { label: 'StreetWize', image: 'projects/feed-the-feed.png' },
    ])}</section>`,
    notes: 'Then XR added more worlds.'
  },
  {
    id: 'part1-09-sidequests',
    duration: 2,
    title: 'The side quests did not stop',
    className: 'slide-collage sidequests',
    html: `<section class="sidequest-collage" data-interaction="snap-collage"><h2 class="sr-only">Side quests</h2>${cards([
      { label: 'Geekcon', image: 'about/oded-burner.jpg' },
      { label: 'Pyro', image: 'about/fireworks.jpg' },
      { label: 'Burns', image: 'about/burning-man-sculpture.jpg' },
      { label: 'Imperial March', image: 'history/brcvr-playa.jpg' },
    ])}</section>`,
    notes: 'And none of the side quests stopped.'
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
    ])}</div>${hotspot('Pull the tiles back out', 'data-action="pull-tiles"')}</section>`,
    notes: 'Busy was already normal.'
  },
  {
    id: 'part1-11-projects-year',
    duration: 12,
    title: 'Projects / year',
    className: 'slide-chart yearly-projects',
    html: yearlyChart({ throughYear: 2024, phase: '2006–2024' }),
    notes: 'This is the actual annual inventory from 2006 through 2024. Each bar is the number of projects active during that year, not only projects started that year. The shape is noisy but broadly stable.'
  },
  {
    id: 'part1-12-then',
    duration: 5,
    title: '2025',
    className: 'slide-chart yearly-projects yearly-projects--2025',
    html: yearlyChart({ throughYear: 2025, highlightYear: 2025, phase: '2025 · 18 projects' }),
    notes: 'Keep the chart fixed and add only the 2025 bar: eighteen active projects. The baseline moved.'
  },
  {
    id: 'part1-13-now',
    duration: 7,
    title: '2026',
    className: 'slide-chart yearly-projects yearly-projects--2026',
    html: yearlyChart({ throughYear: 2026, highlightYear: 2026, phase: '2026 · 36 projects' }),
    notes: 'Keep the same chart and add the 2026 bar: thirty-six active projects. The chart almost stops fitting.'
  },
  {
    id: 'part1-14-ai-happened',
    duration: 18,
    title: 'AI Happened',
    className: 'slide-agent-windows',
    html: `<section class="agent-window-wall" data-interaction="cursor-dominance"><h2 data-depth="1">AI Happened</h2><div class="agent-windows" data-depth="2"><button type="button" class="agent-window" data-agent="research">research</button><button type="button" class="agent-window" data-agent="code">code</button><button type="button" class="agent-window" data-agent="tests">tests</button><button type="button" class="agent-window" data-agent="art">art</button><button type="button" class="agent-window" data-agent="submissions">submissions</button></div>${hotspot('Move the cursor between loops', 'data-action="focus-agent"')}</section>`,
    notes: 'I stopped being the person doing every keystroke and became the person steering many loops.'
  },
  {
    id: 'part1-15-lovelink',
    duration: 3,
    title: 'LoveLink',
    className: 'slide-project lovelink',
    html: `<section class="project-feature project-feature--ui" data-interaction="float-ui"><div class="project-image" data-depth="2">${asset('projects/lovelink.jpg', 'LoveLink project')}</div><h2 data-depth="1">LoveLink</h2><div class="commit-ticker" data-depth="3">commit · commit · commit</div></section>`,
    notes: 'Relationship/love progression game and app.'
  },
  {
    id: 'part1-16-save-point',
    duration: 3,
    title: 'Save Point',
    className: 'slide-project save-point',
    html: `<section class="project-feature project-feature--game" data-interaction="multiply-windows"><div class="project-image" data-depth="1"><video src="./assets/projects/save-point.webm" muted loop playsinline aria-label="Save Point gameplay"></video></div><h2 data-depth="2">Save Point</h2><div class="tiny-windows" data-depth="3"><span>narrative</span><span>web</span><span>build</span></div></section>`,
    notes: 'A narrative game—and the project behind the expensive lesson later.'
  },
  {
    id: 'part1-17-glasses',
    duration: 3,
    title: 'Where Are My Glasses?',
    className: 'slide-project glasses',
    html: `<section class="project-feature project-feature--focus" data-interaction="rack-focus"><div class="project-image" data-depth="2">${asset('projects/where-are-my-glasses.jpg', 'Where Are My Glasses project')}</div><h2 data-depth="1">Where Are My Glasses?</h2>${hotspot('Focus the glasses', 'data-action="rack-focus"')}</section>`,
    notes: 'Mixed-reality comedy about neurodivergence.'
  },
  {
    id: 'part1-18-meditation',
    duration: 3,
    title: 'Meditation: EXTREME!!!1',
    className: 'slide-project meditation',
    html: `<section class="project-feature project-feature--contrast" data-interaction="shake-reduced-motion"><div class="project-image" data-depth="2">${asset('projects/meditation-extreme.jpg', 'Meditation Extreme project')}</div><h2 data-depth="1">Meditation: EXTREME!!!1</h2>${hotspot('Toggle calm / chaos', 'data-action="toggle-chaos"')}</section>`,
    notes: 'Meditation as an extreme comedy sport. Shake stops in reduced-motion mode.'
  },
  {
    id: 'part1-19-feed-the-feed',
    duration: 3,
    title: 'Feed The Feed',
    className: 'slide-project feed-the-feed',
    html: `<section class="project-feature project-feature--dashboard" data-interaction="reveal-port-note"><div class="project-image" data-depth="2">${asset('projects/feed-the-feed.png', 'Feed The Feed studio')}</div><h2 data-depth="1">Feed The Feed</h2><button type="button" class="port-note" data-action="reveal-port">Three.js port?</button></section>`,
    notes: 'A Horizon project, then another project to port it.'
  },
  {
    id: 'part1-20-jigtrade',
    duration: 2,
    title: 'JigTrade',
    className: 'slide-project jigtrade',
    html: `<section class="project-feature project-feature--puzzle" data-interaction="swap-tiles"><div class="project-image" data-depth="2">${asset('projects/jigtrade.png', 'JigTrade project')}</div><h2 data-depth="1">JigTrade</h2>${hotspot('Swap the puzzle tiles', 'data-action="swap-tiles"')}</section>`,
    notes: 'A puzzle collecting, trading, and battle system.'
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
    id: 'part1-23-currency',
    duration: 2,
    title: 'Currency converter',
    className: 'slide-project utility currency',
    html: `<section class="utility-phone" data-interaction="split-recombine"><div class="phone-shell" data-depth="2"><span class="currency-chip">₪</span><span class="swap-arrow">↔</span><span class="currency-chip">$</span></div><h2 data-depth="1">Currency converter</h2>${hotspot('Split and recombine', 'data-action="swap-currency"')}</section>`,
    notes: 'An audience-of-one utility.'
  },
  {
    id: 'part1-24-car-appraiser',
    duration: 2,
    title: 'Car Appraiser Finder',
    className: 'slide-project utility car-appraiser',
    html: `<section class="utility-phone" data-interaction="fan-cards"><div class="phone-shell phone-shell--map" data-depth="2"><span class="map-dot"></span><span class="map-line"></span><button type="button" class="finder-card" data-action="fan-cards">find</button></div><h2 data-depth="1">Car Appraiser Finder</h2></section>`,
    notes: 'Another tiny tool for a specific personal need.'
  },
  {
    id: 'part1-25-camsport',
    duration: 2,
    title: 'CamSport',
    className: 'slide-project camsport',
    html: `<section class="project-feature project-feature--sports" data-interaction="ball-arc"><div class="project-image" data-depth="2">${asset('projects/camsport.png', 'CamSport')}</div><h2 data-depth="1">CamSport</h2><button type="button" class="ball" data-action="ball-arc" aria-label="Control ball arc">●</button></section>`,
    notes: 'One short sentence from the local project during build.'
  },
  {
    id: 'part1-26-show-tracker',
    duration: 2,
    title: 'Show tracker',
    className: 'slide-project utility show-tracker',
    html: `<section class="stacked-phone-cards" data-interaction="stack-cards"><div class="show-card show-card--1" data-depth="1">watched</div><div class="show-card show-card--2" data-depth="2">next</div><div class="show-card show-card--3" data-depth="3">maybe</div><h2>Show tracker</h2>${hotspot('Reorder the stack', 'data-action="stack-cards"')}</section>`,
    notes: 'A tracker because the existing trackers were not mine.'
  },
  {
    id: 'part1-27-kaiju-qa',
    duration: 2,
    title: 'Kaiju QA',
    className: 'slide-project kaiju-qa',
    html: `<section class="kaiju-scene" data-interaction="stamp-pass"><div class="kaiju-art" data-depth="2">${asset('projects/kaiju-qa.png', 'Kaiju QA')}</div><h2 data-depth="1">Kaiju QA</h2><button type="button" class="pass-stamp" data-action="stamp-pass">PASS</button></section>`,
    notes: 'Built in three days for OpenAI Build Week.'
  },
  {
    id: 'part1-28-hackathons-funds-talks',
    duration: 5,
    title: 'Hackathons. Funds. Talks.',
    className: 'slide-slot-machine',
    html: `<section class="slot-machine" data-interaction="drag-lever"><h2 data-depth="1">Hackathons.<br>Funds.<br>Talks.</h2><div class="slot-window" data-depth="2">${cards([
      { label: 'submission', image: 'projects/kaiju-qa.png' },
      { label: 'talk', image: 'about/oded-maker.jpg' },
      { label: 'deadline', image: 'projects/save-point.webm' },
    ])}</div><button type="button" class="slot-lever" data-action="pull-slot">pull</button></section>`,
    notes: 'The software projects generate applications, talks, demos, and deadlines. No private names.'
  },
  {
    id: 'part1-29-all-at-once',
    duration: 8,
    title: 'All at once.',
    className: 'slide-swimlane',
    html: `<section class="swimlane-wall" data-interaction="reorder-lanes"><h2 data-depth="1">All at once.</h2><div class="swimlanes" data-depth="2">${[
      'LoveLink', 'Save Point', 'Glasses', 'Meditation', 'Feed The Feed', 'JigTrade', 'Improv', 'CamSport', 'Kaiju QA', 'Talks'
    ].map((label, index) => `<button type="button" class="swimlane swimlane--${index + 1}" data-lane="${label}" data-depth="${index % 3 + 1}"><span>${label}</span><i></i><i></i><i></i></button>`).join('')}</div>${hotspot('Drag to reorder lanes', 'data-action="reorder-lanes"')}</section>`,
    notes: 'Name only a few collisions, not all nineteen. Transition: “So—how?”'
  }
];

