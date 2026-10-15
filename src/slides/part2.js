const esc = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

const card = ({ label, title, detail = '', tone = 'pink', depth = 2, asset = '', draggable = true }) => `
  <article class="project-card project-card--${tone}" data-depth="${depth}" ${draggable ? 'data-draggable="true"' : ''} tabindex="0">
    ${asset ? `<img src="${esc(asset)}" alt="" loading="lazy" draggable="false">` : '<span class="project-card__mark" aria-hidden="true"></span>'}
    <div class="project-card__copy">
      <small>${esc(label)}</small>
      <strong>${esc(title)}</strong>
      ${detail ? `<span>${esc(detail)}</span>` : ''}
    </div>
  </article>`;

export const part2Slides = [
  {
    id: 'part2-how',
    duration: 5,
    title: 'How?',
    className: 'slide--how slide--vortex',
    html: `
      <section class="slide-content slide-content--center" aria-labelledby="part2-how-title">
        <div class="vortex" data-depth="1" aria-hidden="true"><span></span><span></span><span></span></div>
        <h1 id="part2-how-title" data-depth="5">How?</h1>
        <div class="vortex-orbit" data-depth="2" aria-label="Movable project cards">
          ${card({ label: 'memory', title: 'planning', tone: 'cyan', depth: 2 })}
          ${card({ label: 'handoff', title: 'context', tone: 'lime', depth: 3 })}
          ${card({ label: 'guardrail', title: 'limits', tone: 'orange', depth: 2 })}
        </div>
      </section>`,
    notes: 'Bad news: I do not manage them. Good news: I built a system that lets me fail in parallel. Spoken lede (off-screen): I do not manage the projects — I make it possible to fail in parallel. Drag a card into the void.'
  },
  {
    id: 'part2-planning-repo',
    duration: 19,
    title: 'One planning repo.',
    className: 'slide--planning-repo slide--dark-paper',
    html: `
      <section class="slide-content slide-content--split" aria-labelledby="part2-planning-title">
        <header class="slide-heading" data-depth="5">
          <h2 id="part2-planning-title">One planning repo.</h2>
        </header>
        <nav class="repo-tree" aria-label="Planning repository branches" data-depth="2">
          <button class="repo-tree__node repo-tree__node--root" type="button" data-draggable="true">ProjectPlanningAndIdeas</button>
          <ul>
            <li><button type="button" data-draggable="true">Talks</button></li>
            <li><button type="button" data-draggable="true">Projects</button></li>
            <li><button type="button" data-draggable="true">Submissions</button></li>
            <li><button type="button" data-draggable="true">Life tools</button></li>
          </ul>
        </nav>
        <aside class="repo-preview" data-depth="4" aria-live="polite">
          <div class="repo-preview__bar"><span></span><span></span><span></span><small>selected context</small></div>
          <pre><code># next handoff

Goal: make the graph generic.
Keep: three thumbnails.
Avoid: private counts.

Next: write the interaction notes.</code></pre>
        </aside>
      </section>`,
    notes: 'External memory / routing layer for attention — not a project manager. Branches: Talks, Projects, Submissions, Life tools. Click a branch to preview its sanitized Markdown card.'
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
          <article class="system-pane system-pane--plan" data-draggable="true"><span>PLAN</span><strong>state the claim</strong></article>
          <article class="system-pane system-pane--execute" data-draggable="true"><span>EXECUTE</span><strong>make the thing</strong></article>
          <article class="system-pane system-pane--check" data-draggable="true"><span>CHECK</span><strong>try to break it</strong></article>
          <article class="system-pane system-pane--supervise" data-draggable="true"><span>SUPERVISE</span><strong>stop the loop</strong></article>
        </div>
        <div class="critic-stamp" data-depth="4" aria-label="Independent critic">NOPE.</div>
      </section>`,
    notes: 'Speed only counts when another loop can disagree. PLAN = brief/outline/acceptance. EXECUTE = code/assets/experiments. CHECK = screenshots/tests/red pen. SUPERVISE = time/tokens/cost/exit. Critic stamp: prove it. Hover a pane; drag it out of alignment.'
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
        <div class="attention-field" data-depth="2" aria-label="Project windows">
          ${['talk', 'game', 'XR', 'calendar', 'submission', 'tool', 'experiment'].map((name, index) => `
            <button class="attention-window attention-window--${index + 1}" type="button" data-draggable="true" data-depth="${index % 3 + 1}">
              <span>${esc(name)}</span>
            </button>`).join('')}
          <div class="attention-eye" data-depth="5" aria-hidden="true">◉</div>
        </div>
      </section>`,
    notes: 'Context switching becomes useful when state lives outside my head. The urge to switch becomes routing energy. Hover one window to calm the rest and move the eye.'
  },
  {
    id: 'part2-symphony',
    duration: 18,
    title: 'Symphony',
    className: 'slide--symphony slide--paper',
    html: `
      <section class="slide-content slide-content--symphony" aria-labelledby="part2-symphony-title">
        <header class="slide-heading" data-depth="5">
          <h2 id="part2-symphony-title">Symphony</h2>
        </header>
        <div class="conductor-stage" data-depth="2">
          <div class="conductor-baton" data-draggable="true" aria-label="Movable conductor baton">⌁</div>
          <div class="agent-lanes" aria-label="Agent lanes">
            <div class="agent-lane" data-draggable="true"><span>research</span><i></i></div>
            <div class="agent-lane" data-draggable="true"><span>build</span><i></i></div>
            <div class="agent-lane" data-draggable="true"><span>check</span><i></i></div>
          </div>
          <aside class="linear-board" data-depth="4" aria-label="Planning board companion">
            <div class="linear-board__top"><span></span><strong>planning board</strong></div>
            <div class="linear-board__card">context</div>
            <div class="linear-board__card">handoff</div>
            <div class="linear-board__card">review</div>
          </aside>
        </div>
      </section>`,
    notes: 'I tried formal orchestration with Symphony, in tandem with Linear. Use the baton to send work into the lanes, then point out the maintenance meter climbing.'
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
    title: 'Azure OpenAI',
    className: 'slide--azure slide--dashboard',
    html: `
      <section class="slide-content slide-content--dashboard" aria-labelledby="part2-azure-title">
        <header class="slide-heading" data-depth="5">
          <h2 id="part2-azure-title">Azure OpenAI</h2>
        </header>
        <div class="cost-dashboard" data-depth="2" aria-label="Generic fictional cost dashboard">
          <div class="cost-dashboard__bar"><span></span><span></span><span></span><small>usage / fictional sample</small></div>
          <div class="cost-dashboard__grid"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>
          <div class="cost-dashboard__line" data-depth="4"></div>
          <div class="cost-dashboard__redact">ACCOUNT: REDACTED</div>
        </div>
      </section>`,
    notes: 'Then I tried giving one loop more runway. Keep all identifiers fictional and redacted on the visual.'
  },
  {
    id: 'part2-twelve-thousand',
    duration: 10,
    title: '$12,000',
    className: 'slide--twelve-thousand slide--cracked',
    html: `
      <section class="slide-content slide-content--center" aria-labelledby="part2-twelve-thousand-title">
        <div class="crack-overlay" data-depth="1" aria-hidden="true"></div>
        <h2 id="part2-twelve-thousand-title" class="cost-number" data-count-to="12000" data-depth="5">$12,000</h2>
        <video class="evidence-loop" src="./assets/projects/save-point.webm" muted loop autoplay playsinline preload="metadata" aria-label="Save Point gameplay loop"></video>
      </section>`,
    notes: 'For an infinite loop building Save Point overnight. Codex / GPT-5.6 Sol / ultra-high effort / unattended. Roughly twelve thousand dollars in Azure credits.'
  },
  {
    id: 'part2-unrestricted',
    duration: 15,
    title: 'NEVER LEAVE UNRESTRICTED',
    className: 'slide--unrestricted slide--danger',
    html: `
      <section class="slide-content slide-content--guardrails" aria-labelledby="part2-unrestricted-title">
        <header class="slide-heading slide-heading--compact" data-depth="5">
          <h2 id="part2-unrestricted-title">NEVER LEAVE UNRESTRICTED</h2>
        </header>
        <div class="guardrails" data-depth="2">
          ${[
            ['TIME', 'short window'],
            ['TOKENS', 'bounded budget'],
            ['COST', 'hard cap'],
            ['STOP', 'human exit']
          ].map(([label, detail], index) => `<button class="guardrail" type="button" data-draggable="true" data-depth="${index + 1}"><strong>${label}</strong><span>${detail}</span></button>`).join('')}
        </div>
        <div class="plan-reset" data-depth="5">back to a <strong>$20 plan</strong></div>
      </section>`,
    notes: 'Every loop gets a ceiling and an exit. Hard limits: time, tokens, cost, stop. Went back to the $20 plan.'
  },
  {
    id: 'part2-software-changing',
    duration: 18,
    title: 'Software is changing.',
    className: 'slide--software-changing slide--type',
    html: `
      <section class="slide-content slide-content--type-shift" aria-labelledby="part2-software-changing-title">
        <h2 id="part2-software-changing-title" data-depth="5">Software is changing.</h2>
        <div class="type-shift" aria-label="Changing roles" data-depth="2">
          <span class="type-shift__word type-shift__word--old">user</span>
          <span class="type-shift__arrow">→</span>
          <span class="type-shift__word type-shift__word--new">modifier</span>
          <span class="type-shift__arrow">→</span>
          <span class="type-shift__word type-shift__word--new">builder</span>
          <span class="type-shift__arrow">→</span>
          <span class="type-shift__word type-shift__word--new">maintainer</span>
        </div>
      </section>`,
    notes: 'Open source plus agents changes who gets to change software. The tool is no longer the finished product — it is material.'
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
        <div class="maker-panels" data-depth="2">
          <article class="maker-panel" data-draggable="true"><span class="maker-glyph">✦</span><strong>make a tiny tool</strong></article>
          <article class="maker-panel" data-draggable="true"><span class="maker-glyph">↻</span><strong>change the default</strong></article>
          <article class="maker-panel" data-draggable="true"><span class="maker-glyph">∞</span><strong>share the recipe</strong></article>
        </div>
      </section>`,
    notes: 'You will not need permission from the software maker—or a computer-science degree—to adapt the tool. Drag the panels into a new tool.'
  },
  {
    id: 'part2-hyper-personalized',
    duration: 15,
    title: 'Hyper-personalized apps.',
    className: 'slide--hyper-personalized slide--cards',
    html: `
      <section class="slide-content slide-content--personalized" aria-labelledby="part2-hyper-title">
        <header class="slide-heading" data-depth="5">
          <h2 id="part2-hyper-title">Hyper-personalized apps.</h2>
        </header>
        <div class="variant-board" data-depth="2" aria-label="Draggable personal app variants">
          ${card({ label: 'for me', title: 'calendar', tone: 'cyan', depth: 2 })}
          ${card({ label: 'for me', title: 'show tracker', tone: 'pink', depth: 3 })}
          ${card({ label: 'for me', title: 'car finder', tone: 'orange', depth: 2 })}
          ${card({ label: 'for me', title: 'improv dashboard', tone: 'lime', depth: 3 })}
          <div class="variant-plus" data-depth="5" aria-hidden="true">+</div>
        </div>
      </section>`,
    notes: 'Software stops being one product for a market and becomes a material people reshape. Drag two variants together to suggest a hybrid audience-of-one tool.'
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
        <div class="phone-stage" data-depth="2">
          <div class="phone-shell" data-depth="3">
            <div class="phone-notch"></div>
            <img class="taskswipe-placeholder" src="./assets/projects/taskswipe-placeholder.png" alt="NEED IMAGE Of TASKSWIPE SWIPE UI HERE" width="320" height="240">
            <div class="task-stack" aria-label="Draggable task cards">
              <article class="task-card task-card--top" data-draggable="true" tabindex="0"><strong>finish the handoff</strong></article>
              <article class="task-card task-card--middle" data-draggable="true" tabindex="0"><strong>capture the screenshot</strong></article>
              <article class="task-card task-card--bottom" data-draggable="true" tabindex="0"><strong>make the tiny tool</strong></article>
            </div>
            <div class="swipe-actions"><button type="button" aria-label="Send task left">←</button><button type="button" aria-label="Send task right">→</button></div>
          </div>
          <div class="lane-destinations" data-depth="4"><span>PLAN</span><span>CHECK</span><span>EXPERIMENT</span></div>
        </div>
      </section>`,
    notes: 'The practical version: I changed task software to match how my brain sorts work. Placeholder phone UI until a real screenshot lands. Drag or use the two buttons to send cards toward their lanes.'
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
        <div class="final-copy" data-depth="5">
          <h2 id="part2-qr-title">How do I manage 19 projects?</h2>
          <p class="final-answer"><span>I don’t.</span><strong>But here we are.</strong></p>
          <p class="final-url">Scan to open the deck</p>
          <p class="final-controls">← → · T timer · H hide timer</p>
        </div>
        <a class="qr-placeholder" href="https://soundguyai.github.io/CodexTalkOct26/" target="_blank" rel="noreferrer" data-depth="4"><img data-qr alt="QR code to open the live deck"><small>open the live deck</small></a>
        <div class="final-project-drift" data-depth="2" aria-hidden="true">
          <span data-draggable="true">memory</span><span data-draggable="true">limits</span><span data-draggable="true">handoffs</span>
        </div>
      </section>`,
    notes: 'Close with: “How do I manage 19 projects? I don’t. But here we are.” QR → live GitHub Pages deck.'
  }
];
