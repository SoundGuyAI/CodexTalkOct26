import '../everyone-developer.js';

const esc = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

const card = ({ label, title, detail = '', tone = 'pink', depth = 2, asset = '', draggable = true, attrs = '', tabIndex = 0 }) => `
  <article class="project-card project-card--${tone}" data-depth="${depth}" ${draggable ? 'data-draggable="true"' : ''} ${attrs} tabindex="${tabIndex}">
    ${asset ? `<img src="${esc(asset)}" alt="" loading="lazy" draggable="false">` : '<span class="project-card__mark" aria-hidden="true"></span>'}
    <div class="project-card__copy">
      <small>${esc(label)}</small>
      <strong>${esc(title)}</strong>
      ${detail ? `<span>${esc(detail)}</span>` : ''}
    </div>
  </article>`;

const finalProjectBubbles = [
  { label: 'LoveLink', image: 'projects/lovelink.jpg' },
  { label: 'Save Point', image: 'projects/savepoint-hero.png' },
  { label: 'Where Are My Glasses?', image: 'projects/where-are-my-glasses-cover.png' },
  { label: 'Meditation Extreme', image: 'projects/meditation-extreme.jpg' },
  { label: 'Feed The Feed', image: 'projects/feed-the-feed.png' },
  { label: 'JigTrade', image: 'projects/jigtrade.png' },
  { label: 'Improv Dashboard', image: 'projects/improv-dashboard.png' },
  { label: 'CamSport', image: 'projects/camsport.png' },
  { label: 'Kaiju QA', image: 'projects/kaiju-qa.png' },
  { label: 'TaskSwipe', image: 'projects/taskswipe-placeholder.png' },
  { label: 'Improv Calendar', image: 'projects/improv-calendar.png' },
  { label: 'Pizza Morgana', image: 'history/pizza-morgana-logo.png' },
  { label: 'Bolt Riley', image: 'history/bolt-riley.jpg' },
  { label: 'Star Shipping', image: 'history/star-shipping-logo.png' },
  { label: 'Oh SHIP!', image: 'history/oh-ship-logo.jpg' },
  { label: "Herbert's Quest", image: 'history/herberts-quest.jpg' },
  { label: 'Zbang', image: 'history/zbang-logo.png' },
  { label: 'Corbomite', image: 'history/corbomite-logo.jpg' },
  { label: 'BRCvr', image: 'history/brcvr-playa.jpg' },
];

const finalBubbleHtml = finalProjectBubbles.map((item) => `
          <figure class="final-bubble" data-project="${esc(item.label)}">
            <img src="./assets/${esc(item.image)}" alt="" draggable="false">
            <figcaption>${esc(item.label)}</figcaption>
          </figure>`).join('');

export const part2Slides = [
  {
    id: 'part2-how',
    duration: 5,
    title: 'How?',
    className: 'slide--how slide--vortex',
    html: `
      <section class="slide-content slide-content--how" data-interaction="how-void" aria-labelledby="part2-how-title">
        <div class="how-void" data-depth="1" aria-hidden="true"></div>
        <h1 id="part2-how-title" data-depth="5">How?</h1>
        <div class="how-pillars" data-depth="2" aria-label="Three system pillars">
          ${card({ label: '01', title: 'memory', tone: 'cyan', depth: 2, draggable: true, attrs: 'data-how-card="true"', tabIndex: -1 })}
          ${card({ label: '02', title: 'handoffs', tone: 'lime', depth: 3, draggable: true, attrs: 'data-how-card="true"', tabIndex: -1 })}
          ${card({ label: '03', title: 'limits', tone: 'orange', depth: 2, draggable: true, attrs: 'data-how-card="true"', tabIndex: -1 })}
        </div>
      </section>`,
    notes: 'Bad news: I do not manage them. Good news: I built a system that lets me fail in parallel. Three pillars: memory, handoffs, limits. Drag a card if you want.'
  },
  {
    id: 'part2-planning-repo',
    duration: 19,
    title: 'One planning repo.',
    className: 'slide--planning-repo slide--dark-paper',
    html: `
      <section class="slide-content slide-content--split slide-content--repo" aria-labelledby="part2-planning-title">
        <header class="slide-heading" data-depth="5">
          <h2 id="part2-planning-title">One planning repo.</h2>
        </header>
        <nav class="repo-tree" aria-label="Planning repository branches" data-depth="2">
          <button class="repo-tree__node repo-tree__node--root" type="button" data-branch="Projects">ProjectPlanningAndIdeas</button>
          <ul>
            <li><button type="button" data-branch="Talks">Talks</button></li>
            <li><button type="button" data-branch="Projects">Projects</button></li>
            <li><button type="button" data-branch="Games">Games</button></li>
            <li><button type="button" data-branch="Submissions">Submissions</button></li>
            <li><button type="button" data-branch="Life tools">Life tools</button></li>
          </ul>
        </nav>
        <aside class="repo-preview" data-depth="4" aria-live="polite">
          <div class="repo-preview__bar"><span></span><span></span><span></span><small>selected context</small></div>
          <pre><code data-repo-preview># games/

- Oh SHIP!
- Bolt Riley
- Meditation EXTREME
- Where Are My Glasses?

# also life tools + talks</code></pre>
          <div class="repo-game-chips" aria-label="Games in the planning repo">
            <span>Oh SHIP!</span><span>Save Point</span><span>Glasses</span><span>Meditation</span>
          </div>
        </aside>
      </section>`,
    notes: 'External memory / routing layer — not a project manager. Includes games (Oh SHIP!, Save Point, Glasses, Meditation), talks, submissions, life tools. Click a branch to preview.'
  },
  {
    id: 'part2-markdown-handoffs',
    duration: 19,
    title: 'Markdown handoffs.',
    className: 'slide--handoffs slide--paper',
    html: `
      <section class="slide-content slide-content--handoff" aria-labelledby="part2-handoffs-title">
        <header class="slide-heading" data-depth="5">
          <h2 id="part2-handoffs-title">Markdown handoffs.</h2>
        </header>
        <div class="handoff-diagram" data-depth="2" data-interaction="handoff-fly">
          <article class="handoff-lane handoff-lane--human" data-draggable="true">
            <span class="lane-label">HUMAN</span>
            <strong>intent</strong>
          </article>
          <div class="handoff-flight" aria-hidden="true">
            <div class="handoff-paper" data-draggable="true">
              <span class="note-pin"></span>
              <code>BRIEF.md</code>
            </div>
            <div class="handoff-path"></div>
          </div>
          <article class="handoff-lane handoff-lane--agent" data-draggable="true">
            <span class="lane-label">AGENT</span>
            <strong>work</strong>
          </article>
        </div>
      </section>`,
    notes: 'Context gets written down. The next agent gets the state, not my entire brain. Visual: paper brief flies human → agent. Drag the note between lanes if you want to demo live.'
  },
  {
    id: 'part2-parallel-adversarial',
    duration: 25,
    title: 'Parallel + adversarial.',
    className: 'slide--parallel slide--dark-paper',
    html: `
      <section class="slide-content" aria-labelledby="part2-parallel-title">
        <header class="slide-heading slide-heading--compact" data-depth="5">
          <h2 id="part2-parallel-title">Parallel + adversarial.</h2>
        </header>
        <div class="system-grid" data-depth="2">
          <article class="system-pane system-pane--plan" data-draggable="true"><span>PLAN</span><strong>Cursor</strong><em>state the claim</em></article>
          <article class="system-pane system-pane--execute" data-draggable="true"><span>EXECUTE</span><strong>Claude</strong><em>make the thing</em></article>
          <article class="system-pane system-pane--check" data-draggable="true"><span>CHECK</span><strong>Antigravity</strong><em>try to break it</em></article>
          <article class="system-pane system-pane--supervise" data-draggable="true"><span>REVIEW PRS</span><strong>Codex + Cursor</strong><em>both review</em></article>
        </div>
        <div class="critic-stamp" data-depth="4" aria-label="Independent critic">NOPE.</div>
      </section>`,
    notes: 'Plan = Cursor. Execute = Claude. Check = Antigravity. Review PRs = both Codex and Cursor. Speed only counts when another loop can disagree. Critic stamp: prove it.'
  },
  {
    id: 'part2-adhd-feature',
    duration: 15,
    title: 'ADHD is a feature.',
    className: 'slide--adhd slide--neon',
    html: `
      <section class="slide-content slide-content--attention" aria-labelledby="part2-adhd-title">
        <header class="slide-heading" data-depth="5">
          <h2 id="part2-adhd-title">ADHD is a feature.</h2>
        </header>
        <div class="attention-field" data-interaction="focus-energy" aria-label="Finite focus">
          <div class="focus-pool" data-focus-pool role="meter" aria-label="Total focus" aria-valuemin="0" aria-valuemax="100" aria-valuenow="100">
            <span class="focus-pool__label">focus</span>
            <span class="focus-pool__track"><span class="focus-pool__fill"></span></span>
            <span class="focus-pool__readout" data-focus-readout>100%</span>
          </div>
          ${[
            ['talks', 'cyan'],
            ['games', 'pink'],
            ['XR', 'lime'],
            ['calendars', 'orange'],
            ['submissions', 'cyan'],
            ['tools', 'pink'],
            ['experiments', 'lime'],
          ].map(([name, tone], index) => `
            <button class="attention-window attention-window--${tone} attention-window--${index + 1}" type="button" data-energy-card aria-pressed="false" data-charge="0">
              <span class="attention-charge" aria-hidden="true"></span>
              <small class="attention-status">idle</small>
              <strong>${esc(name)}</strong>
            </button>`).join('')}
          <div class="attention-eye" data-depth="5" aria-hidden="true">◉</div>
        </div>
      </section>`,
    notes: 'Focus is a finite pool. Click a card and it fills with energy — about ten seconds if it is the only one. Click a second and every active card still fills, but slower, because they split the same pool. When the bar hits empty, the fill crawls.'
  },
  {
    id: 'part2-symphony',
    duration: 18,
    title: 'Symphony + Linear',
    className: 'slide--symphony slide--paper',
    html: `
      <section class="slide-content slide-content--symphony" aria-labelledby="part2-symphony-title">
        <header class="slide-heading" data-depth="5">
          <h2 id="part2-symphony-title">Symphony + Linear</h2>
        </header>
        <div class="kanban-board" data-interaction="symphony-kanban" data-depth="2" aria-label="Drag tasks across columns">
          <div class="kanban-col" data-kanban-col="idea">
            <header>Idea</header>
            <article class="kanban-card" tabindex="0">deck polish</article>
            <article class="kanban-card" tabindex="0">TaskSwipe mock</article>
          </div>
          <div class="kanban-col" data-kanban-col="todo">
            <header>Todo</header>
            <article class="kanban-card" tabindex="0">chart callouts</article>
          </div>
          <div class="kanban-col" data-kanban-col="agent">
            <header>Agent</header>
            <article class="kanban-card kanban-card--agent" tabindex="0">wiring handoffs</article>
          </div>
          <div class="kanban-col" data-kanban-col="review">
            <header>Review</header>
            <article class="kanban-card" tabindex="0">screenshot pass</article>
          </div>
        </div>
        <p class="kanban-hint">drag into Agent — it fills green, then moves to Review</p>
      </section>`,
    notes: 'Symphony + Linear: orchestration became another board to maintain. Demo: drag a card into Agent. It fills green for about five seconds, then jumps to Review. Then the free-tier limit story.'
  },
  {
    id: 'part2-project-20',
    duration: 10,
    title: 'It became project #20.',
    className: 'slide--project-twenty slide--warning',
    html: `
      <section class="slide-content slide-content--center" aria-labelledby="part2-project-twenty-title">
        <div class="cable-knot" data-depth="1" aria-hidden="true"></div>
        <h2 id="part2-project-twenty-title" data-depth="5">It became project <em>#20</em>.</h2>
        <div class="limit-card" data-depth="2" data-draggable="true">
          <strong>FREE TIER LIMIT</strong>
        </div>
        <div class="googly-rocks" data-depth="4" aria-hidden="true"><span>●</span><span>●</span></div>
      </section>`,
    notes: 'More effort to maintain. No orchestration saved. Then Linear’s free-tier cap — stopped using it.'
  },
  {
    id: 'part2-azure',
    duration: 10,
    title: 'The Save Point site',
    className: 'slide--azure slide--savepoint-site',
    html: `
      <section class="slide-content slide-content--savepoint-site" aria-labelledby="part2-azure-title">
        <header class="slide-heading" data-depth="5">
          <h2 id="part2-azure-title">The Save Point site they were building.</h2>
          <p class="savepoint-site__line">adventuremob.com/savepoint</p>
        </header>
        <div class="savepoint-shots" data-depth="2">
          <figure>
            <img src="./assets/projects/savepoint-hero.png" alt="Save Point website hero: Ever get the feeling you've done this before?" />
            <figcaption>Hero</figcaption>
          </figure>
          <figure>
            <img src="./assets/projects/savepoint-world.png" alt="Save Point website world section: Bright screenshots. Moving crowds. One game to show." />
            <figcaption>World</figcaption>
          </figure>
          <figure>
            <img src="./assets/projects/savepoint-how-it-plays.png" alt="Save Point website how it plays: A game within a game." />
            <figcaption>How it plays</figcaption>
          </figure>
        </div>
      </section>`,
    notes: 'The overnight loop was building the live Save Point site at adventuremob.com/savepoint. Hero, the world chapter, and how it plays.'
  },
  {
    id: 'part2-twelve-thousand',
    duration: 10,
    title: '$20k',
    className: 'slide--twelve-thousand slide--cracked',
    html: `
      <section class="slide-content slide-content--spend" aria-label="Foundry Models token spend">
        <div class="crack-overlay" data-depth="1" aria-hidden="true"></div>
        <h2 id="part2-twelve-thousand-title" class="cost-number" data-count-to="20000" data-depth="5" aria-hidden="true">$20k</h2>
        <div class="spend-evidence" data-spend-zoom tabindex="0" role="button" aria-expanded="false" aria-label="Zoom in on the Foundry spend amounts">
          <div class="spend-viewport">
            <div class="spend-zoom">
              <img class="spend-shot" src="./assets/projects/foundry-models-spend.png" alt="" />
              <table class="spend-table">
                <thead>
                  <tr>
                    <th scope="col">Service name</th>
                    <th scope="col">Service resources</th>
                    <th scope="col">Spend</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Foundry Models</td>
                    <td>5.6 sol ShortCo inp PP Gl TM Tokens</td>
                    <td class="spend-amount">$11420.21</td>
                  </tr>
                  <tr>
                    <td>Foundry Models</td>
                    <td>5.6 sol ShortCo Cd inp PP Gl TM Tokens</td>
                    <td class="spend-amount">$7877.25</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <p class="spend-caption">Foundry Models · token spend · click to zoom</p>
        </div>
      </section>`,
    notes: 'Foundry Models token spend on the Save Point site loop. The two rows are about $11,420 and $7,877 — roughly $20k. Codex / GPT-5.6 Sol / ultra-high effort / unattended.'
  },
  {
    id: 'part2-unrestricted',
    duration: 15,
    title: 'NEVER LEAVE UNRESTRICTED',
    className: 'slide--unrestricted slide--danger',
    html: `
      <section class="slide-content slide-content--guardrails" data-interaction="guardrail-taps" aria-labelledby="part2-unrestricted-title">
        <header class="slide-heading slide-heading--compact" data-depth="5">
          <h2 id="part2-unrestricted-title">NEVER LEAVE <span class="ban-word">UNRESTRICTED<svg class="ban-stamp" viewBox="0 0 120 48" preserveAspectRatio="none" aria-hidden="true"><ellipse cx="60" cy="24" rx="54" ry="20" fill="none" stroke="#ff354d" stroke-width="5" vector-effect="non-scaling-stroke"/><line x1="22" y1="8" x2="98" y2="40" stroke="#ff354d" stroke-width="5" stroke-linecap="round" vector-effect="non-scaling-stroke"/></svg></span></h2>
        </header>
        <div class="guardrails" data-depth="2">
          ${[
            ['TIME', 'short window'],
            ['TOKENS', 'bounded budget'],
            ['COST', 'hard cap'],
            ['STOP', 'human exit']
          ].map(([label, detail]) => `<button class="guardrail" type="button" data-tap aria-pressed="false"><span class="tap" aria-hidden="true"><span class="tap__handle"></span><span class="tap__neck"></span><span class="tap__spout"></span><span class="tap__stream"><i></i><i></i><i></i></span></span><strong>${label}</strong><span>${detail}</span></button>`).join('')}
        </div>
        <div class="plan-reset" data-depth="5">back to a <strong>$20 plan</strong></div>
      </section>`,
    notes: 'Every loop gets a ceiling and an exit. The four taps start open — the loop is unrestricted. Click a card to shut that limit (time, tokens, cost, stop); click again to reopen. When all four are shut, the ban stamp lands on UNRESTRICTED. Went back to the $20 plan.'
  },
  {
    id: 'part2-software-changing',
    duration: 18,
    title: 'Software is changing.',
    className: 'slide--software-changing slide--type',
    html: `
      <section class="slide-content slide-content--type-shift" aria-labelledby="part2-software-changing-title">
        <h2 id="part2-software-changing-title" data-depth="5">Software is changing.</h2>
        <div class="software-chains" data-interaction="software-shift" data-step="0" data-depth="2" role="button" tabindex="0" aria-label="Developer, Prompt, API. Click to scratch the next word.">
          <div class="software-chain software-chain--past">
            <span class="software-term" data-past="0"><span class="software-term__word">Developer</span></span>
            <span class="software-chain__arrow" aria-hidden="true">→</span>
            <span class="software-term" data-past="1"><span class="software-term__word">Prompt</span></span>
            <span class="software-chain__arrow" aria-hidden="true">→</span>
            <span class="software-term" data-past="2"><span class="software-term__word">API</span></span>
          </div>
          <div class="software-chain software-chain--now" hidden>
            <span class="software-now" data-now="0" hidden><strong>Everyone</strong></span>
            <span class="software-chain__arrow" data-now-arrow="1" hidden aria-hidden="true">→</span>
            <span class="software-now" data-now="1" hidden><strong>Agent</strong></span>
            <span class="software-chain__arrow" data-now-arrow="2" hidden aria-hidden="true">→</span>
            <span class="software-now software-now--aai" data-now="2" hidden>
              <strong>AAI</strong>
              <span class="software-expansion" hidden>Application Agent Interface</span>
            </span>
          </div>
        </div>
      </section>`,
    notes: 'Open source plus agents changes who gets to change software. Start on Developer → Prompt → API. Each click scratches the next word and reveals Everyone, then Agent, then AAI. AAI expands to Application Agent Interface.'
  },
  {
    id: 'part2-everyone-developer',
    duration: 10,
    title: 'Everyone is a developer.',
    className: 'slide--everyone-developer slide--illustrated',
    html: `
      <section class="slide-content" aria-labelledby="part2-everyone-developer-title">
        <header class="slide-heading" data-depth="5">
          <h2 id="part2-everyone-developer-title">Everyone is a developer.</h2>
        </header>
        <div class="maker-stage" data-interaction="everyone-developer" data-depth="2">
          <div class="yours-screen" aria-hidden="true">
            <span class="yours-row"></span>
            <span class="yours-row"></span>
            <span class="yours-row"></span>
          </div>
          <div class="yours-screen__bar" aria-hidden="true">
            <span class="yours-screen__dots"><i></i><i></i><i></i></span>
            <strong class="yours-screen__title">App</strong>
          </div>
          <div class="maker-panels">
            <button type="button" class="maker-panel" data-maker="change" tabindex="-1" aria-pressed="false"><span class="maker-glyph" aria-hidden="true">✦</span><strong><span class="maker-word">Create</span> <span class="maker-rest">any software</span></strong></button>
            <button type="button" class="maker-panel" data-maker="ask" tabindex="-1" aria-pressed="false"><span class="maker-glyph" aria-hidden="true">↻</span><strong><span class="maker-word">Tweak</span><span class="maker-rest">, <span class="maker-code">don’t code<span class="maker-strike" aria-hidden="true"></span></span></span></strong></button>
            <button type="button" class="maker-panel" data-maker="yours" tabindex="-1" aria-pressed="false"><span class="maker-glyph" aria-hidden="true">∞</span><strong><span class="maker-rest">Make it </span><span class="maker-word">Yours</span></strong></button>
          </div>
        </div>
      </section>`,
    notes: 'You will not need permission from the software maker—or a computer-science degree—to adapt the tool. Click “Create any software” and Create grows to fill a white card. Click “Tweak, don’t code” and Tweak grows, don’t code is crossed out, and that card turns white. Yours grows large and that card stays black.'
  },
  {
    id: 'part2-hyper-personalized',
    duration: 15,
    title: 'Hyper-personalized apps.',
    className: 'slide--hyper-personalized slide--cards',
    html: `
      <section class="slide-content slide-content--personalized" data-interaction="stuff-chest" aria-labelledby="part2-hyper-title">
        <header class="slide-heading" data-depth="5">
          <h2 id="part2-hyper-title">Hyper-personalized apps.</h2>
        </header>
        <div class="variant-board" data-depth="2" aria-label="Personal app variants. Click a box to put it in my Stuff.">
          ${card({ label: 'for me', title: 'calendar', tone: 'cyan', depth: 2, draggable: false, attrs: 'data-stuff-box="true" role="button" aria-label="Put calendar in my Stuff"' })}
          ${card({ label: 'for me', title: 'show tracker', tone: 'pink', depth: 3, draggable: false, attrs: 'data-stuff-box="true" role="button" aria-label="Put show tracker in my Stuff"' })}
          ${card({ label: 'for me', title: 'car finder', tone: 'orange', depth: 2, draggable: false, attrs: 'data-stuff-box="true" role="button" aria-label="Put car finder in my Stuff"' })}
          ${card({ label: 'for me', title: 'improv dashboard', tone: 'lime', depth: 3, draggable: false, attrs: 'data-stuff-box="true" role="button" aria-label="Put improv dashboard in my Stuff"' })}
          <div class="variant-plus" data-depth="5" aria-hidden="true">+</div>
        </div>
        <aside class="stuff-chest" data-stuff-chest>
          <div class="stuff-chest__scene">
            <div class="stuff-chest__lid" aria-hidden="true"></div>
            <div class="stuff-chest__base" aria-hidden="true">
              <span class="stuff-chest__band"></span>
              <span class="stuff-chest__latch"></span>
            </div>
            <div class="stuff-chest__pile" data-stuff-pile></div>
            <span class="stuff-chest__count" data-stuff-count hidden>0</span>
          </div>
          <p class="stuff-chest__label">my Stuff</p>
        </aside>
      </section>`,
    notes: 'Software stops being one product for a market and becomes a material people reshape. Click any box: the chest opens, the box goes into my Stuff, and the chest closes. Each box stays inside.'
  },
  {
    id: 'part2-taskswipe',
    duration: 17,
    title: 'TaskSwipe',
    className: 'slide--taskswipe slide--phone',
    html: `
      <section class="slide-content slide-content--taskswipe" aria-labelledby="part2-taskswipe-title">
        <header class="slide-heading" data-depth="5">
          <h2 id="part2-taskswipe-title">TaskSwipe</h2>
        </header>
        <div class="taskswipe-stage" data-interaction="taskswipe" data-depth="2">
          <div class="taskswipe-shell" data-depth="3">
            <div class="taskswipe-topbar">
              <strong>TaskSwipe</strong>
              <span class="taskswipe-badge">DEMO</span>
              <span class="taskswipe-week">This week</span>
            </div>
            <p class="taskswipe-count" data-swipe-status>3 left</p>
            <div class="taskswipe-deck-area">
              <div class="taskswipe-hint taskswipe-hint--keep">KEEP</div>
              <div class="taskswipe-hint taskswipe-hint--postpone">POSTPONE</div>
              <div class="taskswipe-stack" aria-label="Swipeable task cards">
                <article class="taskswipe-card" style="--card-tint:#3d6ea8">
                  <div class="taskswipe-card__header"><span>PROJECTS</span><time>Tue 14:00</time></div>
                  <h3>Polish chart callouts</h3>
                  <p>Codex meetup deck · 25m</p>
                </article>
                <article class="taskswipe-card is-behind" style="--card-tint:#8a4b9a">
                  <div class="taskswipe-card__header"><span>GAMES</span><time>Wed 10:30</time></div>
                  <h3>Save Point build check</h3>
                  <p>narrative web pass · 40m</p>
                </article>
                <article class="taskswipe-card is-behind" style="--card-tint:#2f7a62">
                  <div class="taskswipe-card__header"><span>IMPROV</span><time>Thu 19:00</time></div>
                  <h3>Rehearsal console dry run</h3>
                  <p>Improv Dashboard · 1h</p>
                </article>
              </div>
            </div>
            <div class="taskswipe-actions">
              <button type="button" data-swipe="keep" aria-label="Keep task">← Keep</button>
              <button type="button" data-swipe="postpone" aria-label="Postpone task">Postpone →</button>
            </div>
          </div>
          <aside class="taskswipe-legend" data-depth="4">
            <p><strong>← keep</strong> today</p>
            <p><strong>postpone →</strong> later</p>
          </aside>
        </div>
      </section>`,
    notes: 'Interactive mock (no Google backend). Drag left = keep, drag right = postpone — same idea as TaskSwipe. Sample tasks only.'
  },
  {
    id: 'part2-everything',
    duration: 1,
    title: 'Everything.',
    className: 'slide--closing-word slide--everything',
    html: `
      <section class="slide-content slide-content--center" aria-labelledby="part2-everything-title">
        <div class="multiverse-flash" data-depth="1" aria-hidden="true"></div>
        <h2 id="part2-everything-title" data-depth="5">Everything.</h2>
      </section>`,
    notes: 'Begin the closing cadence. Let the visual do most of the work.'
  },
  {
    id: 'part2-everywhere',
    duration: 1,
    title: 'Everywhere.',
    className: 'slide--closing-word slide--everywhere',
    html: `
      <section class="slide-content slide-content--center" aria-labelledby="part2-everywhere-title">
        <div class="chromatic-jump" data-depth="1" aria-hidden="true"></div>
        <h2 id="part2-everywhere-title" data-depth="5">Everywhere.</h2>
      </section>`,
    notes: 'A short verse jump. Keep the word readable.'
  },
  {
    id: 'part2-all-at-once',
    duration: 2,
    title: 'All at once.',
    className: 'slide--closing-word slide--all-at-once',
    html: `
      <section class="slide-content slide-content--center" aria-labelledby="part2-all-at-once-title">
        <div class="bagel-collapse" data-depth="1" aria-hidden="true"><span></span><span></span><span></span></div>
        <h2 id="part2-all-at-once-title" data-depth="5">All at once.</h2>
      </section>`,
    notes: 'Collapse the multiverse into the final bagel/QR slide.'
  },
  {
    id: 'part2-qr-close',
    duration: 10,
    title: 'How do I manage 19 projects?',
    className: 'slide--qr-close slide--final',
    html: `
      <section class="slide-content slide-content--final" aria-labelledby="part2-qr-title">
        <div class="final-bagel" data-depth="1" aria-hidden="true"></div>
        <div class="final-copy">
          <h2 id="part2-qr-title">How do I manage 19 projects?</h2>
          <p class="final-answer"><span>I don’t.</span><strong>But here we are.</strong></p>
          <p class="final-url">Scan the deck or LinkedIn</p>
          <p class="final-controls">← → · T timer · H hide timer</p>
        </div>
        <div class="qr-pair" data-depth="2">
          <a class="qr-placeholder" href="https://soundguyai.github.io/CodexTalkOct26/" target="_blank" rel="noreferrer"><img data-qr alt="QR code to open the live deck"><small>open the live deck</small></a>
          <a class="qr-placeholder" href="https://www.linkedin.com/in/soundguy" target="_blank" rel="noreferrer"><img data-qr-linkedin alt="QR code to LinkedIn"><small>LinkedIn</small></a>
        </div>
        <div class="final-project-drift" aria-hidden="true">
          ${finalBubbleHtml}
        </div>
      </section>`,
    notes: 'Close with: “How do I manage 19 projects? I don’t. But here we are.” Nineteen real projects drift toward the bagel. Left QR → live GitHub Pages deck. Right QR → https://www.linkedin.com/in/soundguy. Next still plays the next chorus note.'
  }
];
