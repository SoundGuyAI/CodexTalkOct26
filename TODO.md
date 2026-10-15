# Deck revision TODO

Working list from the Oct 15 notes. Check items off as they land. Related editable files: `SLIDE-ORDER-15-27.md`, `ASSETS-NEEDED.md`.

---

## 1. Reorder project spotlight slides (15–27)

- [x] Desired order locked in [`SLIDE-ORDER-15-27.md`](./SLIDE-ORDER-15-27.md)
- [ ] **Organize the deck** to match that order: rearrange the slide definitions in `src/slides/part1.js` so slides 15–27 appear in the new sequence
- [ ] Update `OUTLINE.md` (and any tests / hash refs that assume old numbering for those titles) to match
- [ ] Re-check timing / speaker notes still make sense after the shuffle

**Target order (from the MD file):**

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

**Old deck order (for reference):** LoveLink → Save Point → Where Are My Glasses? → Meditation: EXTREME!!!1 → Feed The Feed → JigTrade → Improv Dashboard → Improv Calendar → Currency converter → Car Appraiser Finder → CamSport → Show tracker → Kaiju QA

---

## 2. Graph data fix

- [ ] Change **2019** bar from **4** → **10** projects in `yearlyProjects` (`src/slides/part1.js`)
- [ ] Confirm bar height / hover label / aria text all show 10

---

## 3. Slides 4–9 — chronological project images only (no repeats)

Show only era-correct project images, chronologically, **no image reuse** across the deck unless specifically needed.

| Slide | Era / theme | Expected subjects (from outline) |
|---:|---|---|
| 4 | Adventure-game collage | Zbang, Pizza Morgana, Knights, Rock Band |
| 5 | Mobile / console | Star Shipping, Spinning Cube, Larry demo, Gun N' Blade |
| 6 | Adventure + publishing | Bolt Riley, Avner, Herbert's Quest, Nightmare Playground |
| 7 | Community | GDC stages, Game Dev Day, GGJ groups (+ teaching if kept) |
| 8 | XR | Star Mates, BRCvr, Oh SHIP!, StreetWize |
| 9 | Side quests | Geekcon, pyro, burns, Imperial March / hard-drive bit |

- [x] Replace wrong / reused project assets on slides 4–9 with real images or placeholders
- [x] Placeholder copy format: `NEED IMAGE Of {WHATEVER} HERE`
- [x] List every missing image in [`ASSETS-NEEDED.md`](./ASSETS-NEEDED.md)
- [x] First scrape pass from Corbomite / Star Shipping / Oh SHIP / itch / YouTube (see `assets/SOURCES.md`)

**Still PLACEHOLDER (need you):** Knights, Rock Band, Spinning Cube, Larry demo, Gun N' Blade, Herbert's Quest, Nightmare Playground, GDC/Game Dev Day/GGJ/Teaching, StreetWize, Midburn pyro, Imperial March HDD — plus currency / car / show tracker / TaskSwipe (see `ASSETS-NEEDED.md`).

---

## 4. Global image policy

- [ ] Audit entire deck for repeated images
- [ ] Keep a repeat only when intentionally the same visual beat (e.g. mosaic summary of earlier frames)
- [ ] Document intentional repeats vs accidental ones

---

## 5. Corner “bubble” / hotspot review

These look like buttons (and often *are* `<button class="hotspot">`) in the corner. Some copy is useful; some feels random or decorative.

**Current hotspots (part 1):**

| Slide | Label | Intended action |
|---:|---|---|
| 1 | Tilt the multiverse | tilt |
| 3 | Pause the orbit | pause-orbit |
| 10 | Pull the tiles back out | pull-tiles |
| 14 | Move the cursor between loops | focus-agent |
| 17 | Focus the glasses | rack-focus |
| 18 | Toggle calm / chaos | toggle-chaos |
| 20 | Swap the puzzle tiles | swap-tiles |
| 23 | Split and recombine | swap-currency |
| 26 | Reorder the stack | stack-cards |
| 29 | Drag to reorder lanes | reorder-lanes |

**Also check interaction-hint lines in part 2** (e.g. “drag a card into the void”, pane hover hints).

- [ ] Reviewer pass: keep / rewrite / remove each bubble
- [ ] Where kept, make the interaction actually interesting (not fake-button chrome)
- [ ] If needed: creative interactive director ideation pass before implementing

---

## 6. Graph hover bubbles (slides 11–13)

On early-year bars, show hover bubbles / pins for projects such as:

- Corbomite
- Zbang
- Pizza Morgana
- Star Shipping
- Bolt Riley
- Herbert's Quest
- Oh SHIP!
- BRCvr
- Uniform
- (and similar era peers)

- [ ] Map each name to the correct year
- [ ] Place bubbles on the **right year** bars on slides 11–13
- [ ] Keep late-era pins (LoveLink / agent era) without colliding with early-year labels

---

## 7. Landscape layout review (maximized desktop — not a phone app)

- [ ] Visual expert pass over **all** slides at full landscape viewport
- [ ] Fix spacing, scale, overflow, and “phone-app” densities that look wrong on a wide stage
- [ ] **Slide 32 (Markdown handoffs.)** — currently text/lanes only; add graphics (handoff diagram, paper → agent visual, motion) so it doesn’t feel empty/weird
- [ ] Spot-check slide 33 / 39 cards still read clearly after layout changes (see notes below)

---

## Quick reference — what is on those cards?

### Slide 33 — Parallel + adversarial.

Four system panes:

| Pane | Title | Detail |
|---|---|---|
| PLAN | state the claim | brief · outline · acceptance test |
| EXECUTE | make the thing | code · assets · experiments |
| CHECK | try to break it | screenshots · tests · red pen |
| SUPERVISE | stop the loop | time · tokens · cost · exit |

Plus critic stamp: **NOPE. / prove it**

### Slide 39 — NEVER LEAVE UNRESTRICTED

Four guardrail cards:

| Label | Detail |
|---|---|
| TIME | short window |
| TOKENS | bounded budget |
| COST | hard cap |
| STOP | human exit |

Plus footer: **back to a $20 plan**

---

## Suggested work order

1. **Apply slide 15–27 reorder** from `SLIDE-ORDER-15-27.md` into the deck (`part1.js` + `OUTLINE.md`) — order is locked
2. Graph 2019 → 10
3. Slides 4–9 placeholders + `ASSETS-NEEDED.md`
4. Image-dedupe audit
5. Graph hover bubbles 11–13
6. Hotspot / bubble review + interactions
7. Landscape visual review (incl. slide 32 graphics)
