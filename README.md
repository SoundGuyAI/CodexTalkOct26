# Everything Everywhere All at Once

An interactive six-minute slide deck for the October 2026 Codex meetup: **how to work on 19 different projects simultaneously**.

## Run locally

```bash
pnpm install
pnpm dev
```

## Controls

- Next: Right, Down, Page Down, or Space
- Previous: Left, Up, or Page Up
- First/last: Home / End
- Fullscreen: F
- Speaker notes: P
- Sound: M
- Pointer movement adds depth; selected cards can be dragged

The corner timer begins when the presentation advances from the title slide and counts down from 6:00.

## Verification

```bash
pnpm run build
pnpm test
```

The Playwright suite checks all 47 slides and writes screenshots to `test-results/slides/`.
