# Deck revision TODO

Working list from the Oct 15 notes. Check items off as they land. Related editable files: `SLIDE-ORDER-15-27.md`, `ASSETS-NEEDED.md`.

---

## 1. Reorder project spotlight slides (15–27)

- [x] Desired order locked in [`SLIDE-ORDER-15-27.md`](./SLIDE-ORDER-15-27.md)
- [x] **Organize the deck** to match that order: rearrange the slide definitions in `src/slides/part1.js` so slides 15–27 appear in the new sequence
- [x] Update `OUTLINE.md` (and any tests / hash refs that assume old numbering for those titles) to match
- [x] Re-check timing / speaker notes still make sense after the shuffle

**Target order (applied):**

1. Currency converter  
2. Car Appraiser Finder  
3. Show tracker  
4. Feed The Feed  
5. CamSport  
6. Kaiju QA  
7. Improv Dashboard  
8. Improv Calendar  
9. LoveLink  
10. JigTrade  
11. Where Are My Glasses?  
12. Meditation: EXTREME!!!1  
13. Save Point  

---

## 2. Graph data fix

- [x] Change **2019** bar from **4** → **10** projects in `yearlyProjects` (`src/slides/part1.js`)
- [x] Confirm bar height / hover label / aria text all show 10

---

## 3. Slides 4–9 — chronological project images only (no repeats)

Show only era-correct project images, chronologically, **no image reuse** across the deck unless specifically needed.

| Slide | Era / theme | Expected subjects (from outline) |
|---:|---|---|
| 4 | Adventure-game collage | Zbang, Pizza Morgana, Knights, Rock Band |
| 5 | Mobile / console | Star Shipping, Spinning Cube, Larry demo, Gun N' Blade |
| 6 | Adventure + publishing | Bolt Riley, Avner, Herbert's Quest, Nightmare Playground |
| 7 | Community | GDC stages, Game Dev Day, GGJ groups (+ teaching if kept) |
| 8 | XR | Star Mates, BRCvr, Oh SHIP!, Time to Escape |
| 9 | Side quests | Geekcon, pyro, burns, Imperial March / hard-drive bit |

- [x] Replace wrong / reused project assets on slides 4–9 with real images or placeholders
- [x] Placeholder copy format: `NEED IMAGE Of {WHATEVER} HERE`
- [x] List every missing image in [`ASSETS-NEEDED.md`](./ASSETS-NEEDED.md)
- [x] First scrape pass from Corbomite / Star Shipping / Oh SHIP / itch / YouTube (see `assets/SOURCES.md`)

**Still PLACEHOLDER (need you):** Knights, Rock Band, Spinning Cube, Larry demo, Gun N' Blade, Herbert's Quest, Nightmare Playground, GDC/Game Dev Day/GGJ/Teaching, Midburn pyro — plus currency / car / show tracker / TaskSwipe (see `ASSETS-NEEDED.md`). Imperial March HDD: HAVE.

---

## 4. Global image policy

- [x] Audit entire deck for repeated images
- [x] Keep a repeat only when intentionally the same visual beat (e.g. mosaic summary of earlier frames)
- [x] Document intentional repeats vs accidental ones

See **Image repeat audit** in [`ASSETS-NEEDED.md`](./ASSETS-NEEDED.md).

---

## 5. Corner “bubble” / hotspot review

**Kept (wired in `main.js`):**

| Slide | Label | Action |
|---:|---|---|
| 1 | Tilt the grid | tilt |
| 3 | Pause orbit | pause-orbit |
| 10 | Pull tiles out | pull-tiles |
| 24 | Swap tiles | swap-tiles |
| 25 | Rack focus | rack-focus |
| 26 | Calm / chaos | toggle-chaos |
| 29 | Reorder lanes | reorder-lanes |

**Removed as decorative chrome:** “Move the cursor between loops” (pointer already drives agent windows), “Split and recombine”, “Reorder the stack”. Part 2 interaction-hint lines stripped; detail lives in speaker notes.

- [x] Reviewer pass: keep / rewrite / remove each bubble
- [x] Where kept, make the interaction actually interesting (not fake-button chrome)

---

## 6. Graph hover bubbles (slides 11–13)

- [x] Map each name to the correct year
- [x] Place bubbles on the **right year** bars on slides 11–13
- [x] Keep late-era pins (LoveLink / agent era) without colliding with early-year labels

Pins: Corbomite 2006, Zbang 2007, Pizza Morgana 2009, Star Shipping 2010, Bolt Riley 2013, Herbert's Quest 2014, Oh SHIP! 2020, BRCvr 2021, LoveLink 2025, agent era 2026. Hover bubbles on bars for the same eras.

---

## 7. Landscape layout review (maximized desktop — not a phone app)

- [x] Visual expert pass over **all** slides at full landscape viewport (CSS landscape tweaks + 1920×1080 Playwright viewport)
- [x] Fix spacing, scale, overflow, and “phone-app” densities that look wrong on a wide stage
- [x] **Slide 32 (Markdown handoffs.)** — HUMAN → flying `BRIEF.md` paper → AGENT diagram
- [x] Spot-check slide 33 / 39 cards still read clearly after layout changes (pared copy; larger pane/guardrail type)

---

## Plan-gap extras (from CONTINUE-AGENT-PROMPT)

- [x] Part 2 word budget — kickers/ledes/extra card sentences moved into `notes`
- [x] Slides 12–13 big **2025** / **2026** titles + 2026 smash bar
- [x] Swimlane expanded to 19 lanes (incl. servers / music / submissions / talks / planning)
- [x] Chart data decision documented in `DECISIONS.md` (inline `yearlyProjects` wins; 2019=10)
- [x] TaskSwipe interactive mock (no backend) — left=keep / right=postpone; styled after TaskSwipe repo
- [x] Timer hotkeys **T** (pause / double-T reset) and **H** (hide)
- [x] Global reduced-motion (CSS + skip parallax / continuous spins in JS)
- [x] Restore mouse parallax + Save Point / slide video autoplay on enter
- [x] Chart labels sit above bars; slide 13 AI Agents callouts
- [x] Slide 14 AI era transition redesign
- [x] Improv Dashboard / Calendar real screenshots (from local project `.screenshots/`)
- [x] Slides 30/31/34/35/40 polish (How, planning+games, ADHD contrast, Symphony+Linear kanban, User/Builder/Modifier strike)
- [x] Transition SFX: rapid advances play Never Gonna Give You Up chorus melody
- [ ] Commit + push coherent chunk — **ask before commit/push**

---

## Suggested work order (done this pass)

1. Apply slide 15–27 reorder
2. Graph 2019 → 10
3. Slides 4–9 placeholders (prior pass)
4. Image-dedupe audit
5. Graph hover bubbles 11–13
6. Hotspot / bubble review + interactions
7. Landscape visual review (incl. slide 32 graphics)
