# Continue: Codex meetup deck — revision pass

You are continuing work on an existing interactive slide deck. **Do not rebuild from scratch.** Read this whole prompt, then the linked source files, then execute the unfinished TODO list and plan gaps below.

## Repos / paths

| What | Path |
|---|---|
| **Deck repo (work here)** | `C:\UnityProj\CodexTalkOct26` |
| **Remote** | https://github.com/SoundGuyAI/CodexTalkOct26 → live: https://soundguyai.github.io/CodexTalkOct26/ |
| **Planning source of truth** | `C:\UnityProj\ProjectPlanningAndIdeas\Talks\Codex-Meetup-Oct-2026\` |
| **Slide list that wins on content** | `06-SLIDE-SKELETON.md` |
| **Format / non-negotiables** | `03-PRESENTATION-AGENT-BRIEF.md` |
| **Speaker notes / stories** | `01-MY-INPUT.md`, `DECISIONS.md` (in deck) |
| **Project data** | `02-PROJECTS.md`, `04-PROJECT-INVENTORY-BY-YEAR.md`, `05-SCRAPED-SOURCES.md` |

Also read in the deck repo: `TODO.md`, `OUTLINE.md`, `ASSETS-NEEDED.md`, `SLIDE-ORDER-15-27.md`, `DECISIONS.md`, `src/slides/part1.js`, `src/slides/part2.js`, `src/main.js`.

## Current state (what Codex already shipped)

- **47-slide** Vite + GSAP static site, deployed via GitHub Actions to Pages (live URL returns 200).
- Structure largely matches `06-SLIDE-SKELETON.md` (title → collages → chart → AI → project spotlights → how → Symphony → $12k → open source → TaskSwipe → close/QR).
- Real assets exist under `public/assets/` for about/history + modern projects (LoveLink, Save Point webm, Glasses, Meditation, Feed The Feed, JigTrade, Improv apps, CamSport, Kaiju QA). Historical collage slides **reuse modern art wrongly**.
- Playwright screenshots exist under `test-results/`; local uncommitted change forces **1920×1080** viewport in `playwright.config.js`.
- Untracked docs from the last session: `TODO.md`, `SLIDE-ORDER-15-27.md` (commit them when you start, or keep updating them as the working checklist).

**Do not** rewrite the stack, rename the talk, or drop sections. This is a polish + correctness pass.

---

## Hard rules (from the plan — enforce while editing)

- **6 minutes**, ~7–10s average; speaker advances (keys/clicker).
- **≤ ~6 visible words per slide** where possible. Part 2 currently violates this hard (ledes, kickers, multi-line card copy on slides 30–42). Prefer cutting on-screen text and moving detail into `notes`.
- **No bullet lists on screen.**
- Visual-first; **16:9**; **offline** (no runtime CDN — already mostly true via Vite + fontsource).
- Homage to *Everything Everywhere All at Once* only (googly eyes, bagel, verse-jump) — **no film stills**.
- No API keys, billing IDs, or private repo names on slides.
- Timer: 6:00 countdown; brief asked for **T** pause/reset and **H** hide — currently only click-to-pause on the timer button. Add the hotkeys if easy.
- Respect `prefers-reduced-motion` globally (not only the meditation shake).

---

## Your job: finish the speaker’s revision TODO (`TODO.md`)

All items below were captured from Oded’s feedback and are **still unchecked**. Do them in this order unless a blocker forces a skip (then note it in `TODO.md`).

### 0. Speaker input gate (do not invent order)

- Open `SLIDE-ORDER-15-27.md`. If it is still the default LoveLink→…→Kaiju QA list with empty scratch notes, **do not reorder yet** — leave a clear note and proceed with other tasks. Only apply reorder after the speaker edits that file (or tells you the new order in chat).

### 1. Graph data fix (do immediately)

In `src/slides/part1.js` `yearlyProjects`:

- Change **2019 from** `4` **→** `10`.
- Confirm bar height, `title`, and `aria-label` all show 10.
- If hover pins exist, keep them consistent.

### 2. Slides 4–9 — chronological images only, no false reuse

Today these collage cards steal modern assets (Glasses, CamSport, Kaiju, Save Point, about photos, fireworks) for historical titles. Fix:

| Slide | Subjects |
|---:|---|
| 4 | Zbang, Pizza Morgana, Knights, Rock Band |
| 5 | Star Shipping, Spinning Cube, Larry demo, Gun N' Blade |
| 6 | Bolt Riley, Avner, Herbert's Quest, Nightmare Playground |
| 7 | GDC stages, Game Dev Day, GGJ groups (+ teaching if kept) |
| 8 | Star Mates, BRCvr, Oh SHIP!, StreetWize |
| 9 | Geekcon, pyro, burns, Imperial March / hard-drive |

Rules:

- Prefer real images from planning repo / `C:\UnityProj\` / links in `05-SCRAPED-SOURCES.md` (speaker’s own work or press about it only).
- If missing: use an obvious placeholder with copy `NEED IMAGE Of {NAME} HERE` (exact format from TODO).
- Log every missing image in `ASSETS-NEEDED.md` (must-have vs nice-to-have).
- Update `assets/SOURCES.md` for anything you add under `public/assets/`.
- Intentional repeats (e.g. slide 10 mosaic summarizing 4–9) are OK; accidental reuse across eras is not.

### 3. Global image-dedupe audit

- Scan all 47 slides for repeated images.
- Keep only intentional repeats; document them briefly in `ASSETS-NEEDED.md` or a short note in `TODO.md`.

### 4. Graph hover bubbles (slides 11–13)

Add/fix pins so early-year bars can show era projects (Corbomite, Zbang, Pizza Morgana, Star Shipping, Bolt Riley, Herbert's Quest, Oh SHIP!, BRCvr, Uniform, etc.) on the **correct year**, without colliding with late-era LoveLink / agent-era pins.

### 5. Corner “hotspot” / bubble review

Part 1 uses `<button class="hotspot">` labels like “Tilt the multiverse”, “Pause the orbit”, etc. Part 2 has interaction-hint lines.

- Keep only bubbles that teach a real, interesting interaction.
- Remove decorative fake chrome.
- Where kept: make the interaction actually work (wire `data-action` handlers in `main.js` if stubs).
- Prefer fewer, better interactions over many pill buttons.

### 6. Landscape layout review (1920×1080 projector, not phone UI)

- Use Playwright at **1920×1080** (already partly set in uncommitted `playwright.config.js` — finish/commit that).
- Fix spacing, scale, overflow, and “phone-app density” on a wide stage.
- **Especially slide 32 (Markdown handoffs):** currently text/lanes-heavy; add a clearer graphic (paper → agent motion / diagram) so it doesn’t feel empty/weird on landscape.
- Spot-check slide 33 (Plan/Execute/Check/Supervise) and slide 39 (NEVER LEAVE UNRESTRICTED guardrail cards) remain readable after layout cuts.

### 7. Apply slides 15–27 reorder (only when order file is locked)

- When `SLIDE-ORDER-15-27.md` is confirmed, reorder arrays in `src/slides/part1.js` and sync `OUTLINE.md`.
- Re-check durations + speaker notes still make sense.

---

## Plan gaps beyond TODO.md (do after or interleaved with the above)

These are mismatches vs `03-PRESENTATION-AGENT-BRIEF.md` / `06-SLIDE-SKELETON.md` that the last session did not finish:

1. **Word budget on Part 2** — strip kickers/ledes/extra card sentences off-screen into `notes`. Skeleton intent: big type + visual; detail is spoken.
2. **Slides 12–13 titles** — skeleton wants big **2025** / **2026**; keep the smash-through-top beat for 2026.
3. **Swimlane (slide 29)** — currently ~10 lanes; story is “all at once / 19”. Expand toward more simultaneous lanes **or** make the fewer lanes feel like overflow chaos without claiming a false count on-screen. maybe redesign this, or consider what would be 19 or how to present it. maybe not as lanes but some other visual representation.  for the missing projects - add stuff like server maintanence, talks, submission we went through , music uploads, etc... you can review in the project plannign repo for things i've done
4. `data/projects.json` — brief asked for chart data driven from inventory. Either generate it from `04-PROJECT-INVENTORY-BY-YEAR.md` and load it, or document in `DECISIONS.md` why the inline `yearlyProjects` array is the source of truth (and keep 2019=10).
5. **TaskSwipe (slide 43)** — still placeholder phone UI. else keep placeholder and keep the ask in `ASSETS-NEEDED.md`. user will give you mockp or link to functioning app 
6. **Timer hotkeys** — add `T` pause/reset and `H` hide/show if not present; keep low-contrast corner timer.
7. **Reduced motion** — global CSS/JS fallback for continuous spins, parallax, shakes.
8. **Verification** — `pnpm test` (or Playwright) after changes; screenshot-audit new problem slides; `pnpm build`. Push when a coherent chunk is done (ask before force-push; never rewrite history).
9. **Commit hygiene** — include `TODO.md` / `SLIDE-ORDER-15-27.md` / playwright viewport fix when committing revision work. Do **not** commit secrets.

---

## Suggested first commits

1. `fix: set 2019 project count to 10` + playwright 1920 viewport + track TODO docs
2. `fix: replace historical collage asset misuse with real/placeholder images`
3. `polish: graph pins, hotspots, landscape layout, slide 32 graphics`
4. (Later) reorder 15–27 when speaker locks the list

---

## Done when

- Every checkbox in `TODO.md` is either `[x]` or explicitly blocked on speaker assets/order with a note.
- No wrong-era image reuse on slides 4–9.
- 2019 bar = 10.
- Landscape screenshots at 1920×1080 look like a talk stage, not a phone demo.
- Part 2 on-screen text is closer to the ≤6-word rule.
- Tests pass; live Pages still works after push.

## Out of scope

- Changing the talk title/theme.
- Adding film copyrighted assets.
- Expanding runtime past 6:00 with new sections.
- Rebuilding on reveal.js / Slidev / HyperFrames from scratch (DECISIONS mentioned HyperFrames; the working build is custom Vite+GSAP — keep it).
