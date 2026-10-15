# Deck decisions

Planning date: 2026-10-15. These choices are for the approval-stage prototype; visual details can still be tuned before implementation.

## Format and framework

- **Deck format:** a static, 16:9 interactive website built with the HyperFrames slideshow runtime and plain HTML/CSS/JavaScript. It will be hosted from this repository on GitHub Pages.
- **Motion:** GSAP timelines for deterministic entrances, transitions, counters, and the project swarm. GSAP Draggable will power deliberately draggable thumbnails and cards. No runtime CDN; dependencies, fonts, media, and sound effects will be bundled locally.
- **Data graphics:** custom SVG/DOM charts driven by a small local data file. The chart remains readable as a static frame, then adds hover/focus details, pointer parallax, and draggable project thumbnails.
- **Reusable catalog pieces:** start from HyperFrames' `animated-bar-chart`, `chart-story`, `count-up`, `swirl-vortex`, and `chromatic-aberration-wipe` components, then restyle them for this deck.
- **Presenter behavior:** full-screen slide snapping; visible next/previous controls; keyboard support for Left/Right, Up/Down, Page Up/Page Down, Space, Home, End, and Escape; touch swipe; presenter notes in a separate view.
- **Timer:** a small always-visible `6:00` countdown in the upper-right. It starts on the first forward navigation (or an explicit Start control), can be paused/reset from presenter controls, turns amber at 1:00 and red at 0:15, and never blocks navigation.
- **Sound:** short local SFX only: verse-jump glitch, chart impact, project-card ticks, `$12,000` crack, and final bagel/QR collapse. Audio is opt-in at the start and has a persistent mute button.

### Alternatives considered

| Option | Decision | Reason |
|---|---|---|
| HyperFrames slideshow | **Use** | Best fit for a bespoke animated deck, deterministic visual QA, speaker notes, interactive hotspots, and a static GitHub Pages build. Apache-2.0. |
| GSAP | **Use** | Strong timeline control plus pointer/drag interactions; it will be bundled locally with the deck. |
| reveal.js | Do not use as the base | Excellent conventional presentation controls and notes, but the visual system would fight its slide conventions more than it helps here. |
| Slidev | Do not use as the base | Great Markdown authoring, but this deck is closer to an interactive motion piece than a text-led technical deck. |
| Three.js / WebGPU | Avoid unless necessary | The bagel, multiverse grid, and charts can be convincing with CSS/SVG. Avoiding a 3D runtime lowers offline and projector risk. |

Primary references: [HyperFrames](https://github.com/heygen-com/hyperframes), [HyperFrames CLI](https://github.com/heygen-com/hyperframes/blob/main/docs/packages/cli.mdx), [GSAP](https://gsap.com/docs/v3/GSAP/), [reveal.js](https://revealjs.com/), [Slidev](https://sli.dev/).

## Visual direction

**Working name:** “The ADHD Multiverse.” It is an homage to multiverse energy, googly eyes, circular voids, abrupt verse jumps, and absurd maximalism without using any film stills, logos, costumes, or copied frames.

- **Base:** near-black `#09090B`, ink `#15131A`, warm paper `#F6F0E4`.
- **Primary accent:** hot magenta `#FF3B81`.
- **Secondary accents:** cyan `#42E8E0`, acid lime `#C9FF4A`, impact orange `#FF7A2F`.
- **Warning:** amber `#FFC247`; danger/bill: red `#FF354D`.
- **Typography:** Archivo Black for large statements; Inter for labels, notes, and controls. Both will be stored as local WOFF2 files. Fallback stack: `Arial Black`, `Segoe UI`, sans-serif.
- **Texture:** subtle paper grain, halftone dots, and RGB separation only during transitions. No permanent noisy filter over screenshots.
- **Composition:** one dominant visual per slide, large type, deep negative space, and occasional deliberate overload when the story reaches “all at once.”

## Interaction system

- Pointer movement creates restrained depth/parallax in the multiverse grid and bagel slides.
- Project thumbnails on graph and swarm slides can be hovered/focused for a name and one-line description, and dragged a short distance before springing or staying where dropped.
- The graph uses broad relative scale, not a spreadsheet of exact public claims. Selected thumbnails point to a few moments; exact counts remain in speaker notes/data, not on-screen.
- Every interactive element also works by keyboard and has a non-interactive visual fallback.
- Reduced-motion mode disables shakes, continuous rotation, and pointer parallax while preserving slide meaning.

## The chosen “19”

1. LoveLink
2. Save Point
3. Where Are My Glasses?
4. Meditation: EXTREME!!!1
5. JigTrade / JigsawVerse
6. Feed The Feed
7. Improv Dashboard
8. Israeli Improv Calendar
9. MusicalImprov
10. TaskSwipe
11. CamSport
12. WatchingApp
13. Currency converter
14. Car Appraiser Finder
15. Symphony experiments
16. Kaiju QA / Loop Engineer
17. Azure OpenAI experiments
18. ProjectPlanningAndIdeas
19. This deck

## Content boundaries

- Bio: “30 years making games · indie developer · XR creator · improviser · ADHD.” Keep it to those points.
- Symphony verdict: it became another project to maintain and did not reduce orchestration work. It ran alongside Linear; the free-tier cap was reached and Linear was dropped.
- `$12,000` story: Codex running GPT-5.6 Sol at ultra-high effort was left overnight in an unrestricted website-building loop for Save Point. It looped indefinitely and consumed roughly $12,000 in Azure credits. Lesson: unattended agents need hard limits—time, tokens, cost, and stop conditions. The workflow returned to a $20 plan.
- Open-source thesis: people will increasingly modify the software they use, build an audience-of-one tool, or adapt an existing one without waiting for the original software maker or first earning a computer-science degree.
- Opening and closing line: **“How do I manage 19 projects? I don't. But here we are.”**

## Timing

The approved speaking plan will total **5:50 (350 seconds)**. The remaining ten seconds are a live-delivery buffer; the on-screen timer still counts down the full 6:00.

## Chart data source

**Source of truth for the Projects / year bars is the inline `yearlyProjects` array in `src/slides/part1.js`**, not a separate `data/projects.json`.

Reasons:
- The public deck should stay a single static Vite bundle with no fetch race on open.
- Inventory markdown (`04-PROJECT-INVENTORY-BY-YEAR.md`) is a private design source and undercounts some years (notably **2019**, corrected on-slide from 4 → **10** per speaker revision).
- Hover labels and pin thumbnails are curated for storytelling, not a full dump of every inventory line.

If the inventory is ever regenerated into JSON for tooling, keep the slide array as the authored override and document deltas here.

## Spotlight order (slides 15–27)

Locked in `SLIDE-ORDER-15-27.md` and applied in `part1.js` / `OUTLINE.md`: utilities first → Feed The Feed / CamSport / Kaiju → improv apps → LoveLink / JigTrade / Glasses / Meditation → **Save Point last** (feeds the later $12k beat).

## Timer hotkeys

- **T** — pause / resume countdown (double-tap T within ~400ms resets to 6:00)
- **H** — hide / show the corner timer
- Click on the timer button still toggles pause/resume
