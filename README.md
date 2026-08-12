# LILY Monolith

A single-screen 3D stacking game. Stack 30 blocks — each a 1/30 horizontal
slice of the LILY Monolith solid (front face brand-exact at 1 : 2.008, depth
W/2 for game presence, the mark's crease split into the two brand greens) —
to reassemble the monolith. **Misses get trimmed**: any non-perfect drop keeps only the overlap
with the tower and sheds the overhang as physics debris, so the footprint
erodes and runs tighten naturally. Only a perfect run rebuilds the true
monolith. Static camera (translation + FOV only, never rotates), constant
block speed, LILY neon palette, procedural audio.

## Run

```sh
npm install
npm run dev        # Next.js dev server → http://localhost:3000/MonoStack
npm run build      # typecheck + static export in out/
```

Input: tap, click, or Space drops the block. `M` (or the HUD button) toggles
sound. Restart is instant and in-place.

## Tune difficulty & feel

Everything tunable lives in `src/config.ts` — nothing else holds a constant:

- `GAME.PERFECT_TOLERANCE` — max center offset that still snaps clean.
- `GAME.SPEED` — constant for every block. `ENTRY_CLEARANCE`/`ENTRY_JITTER` —
  spawn distance and per-level randomization.
- `TRIM.*` — minimum surviving footprint, debris cap/lifetime, loss delay.
- `SCORING.*` — base points and the perfect-streak multiplier.
- `PHYSICS.*`, `FX_CONF.*` (bloom threshold/intensity, shake, flash),
  `AUDIO.*`, `MONOLITH.*` (brand solid dims — change only with a new
  derivation), `CAMERA.*`.

## Reward placeholder

`index.html` → the win overlay (`#overlay-won`) contains
`<!-- REWARD_PLACEHOLDER -->` and an empty labeled container `#reward-slot`.

## Structure

Next.js (App Router) shell around framework-agnostic game modules:

- `app/layout.tsx` + `app/globals.css` — document shell and styles
- `app/page.tsx` — HUD + overlay markup (ids are the contract with `src/ui.ts`)
- `app/GameCanvas.tsx` — client component; dynamically imports and boots the
  game after hydration
- `src/boot.ts` — game bootstrap + frame loop (+ `window.__monostack` test hooks)
- `src/config.ts` — every tunable constant and the palette
- `src/game.ts` — state machine (`READY → PLAYING → RESOLVING → WON | LOST`),
  spawner, mover, trim flow, camera follow, instant reset
- `src/placement.ts` — footprint rects + pure trim resolver
- `src/blocks.ts` — per-rect monolith-slice geometry (crease clamped to the
  surviving front face)
- `src/collapse.ts` — cannon-es debris world (spectacle only)
- `src/score.ts` — height, streak, points, persisted bests
- `src/audio.ts` — procedural WebAudio synth (no assets), mute persisted
- `src/fx.ts` — particle bursts + translation-only camera shake
- `src/scene.ts` — renderer, camera rig (fixed orientation), lights, grid,
  one threshold bloom pass
- `src/endgame.ts` — win sequence (translation + FOV pan, edge light-up)
- `src/anim.ts` — minimal tween runner

## Assets

| Asset | Source |
|---|---|
| Block geometry | Procedural `BufferGeometry`: per-rect slice of the LILY Monolith solid, derived from `monolith-game-geometry.js` (LILY solid derivation, 10 Aug 2026 — brand-owned) |
| Backdrop | Solid black clear color + one `THREE.GridHelper` |
| Lighting | One `THREE.DirectionalLight` + one `THREE.AmbientLight`; one bloom pass; no shadow maps |
| Audio | Procedural WebAudio oscillators — no files |
| Font | Menlo (system monospace — the LILY brand mono per `brand-tokens.mjs`) |
| Favicon | `public/favicon.svg` — copied from `~/Desktop/Lily Design System/assets/` (brand-owned) |
| Color tokens | Copied verbatim from `~/Projects/lily-marketing/visuals/brand-tokens.mjs` (neon rebrand, 9 Aug 2026), plus two solid-derivation face tones that are exact 50% sRGB blends of adjacent tokens: `#B2D328`, `#A4CC20` |

Dependencies: `three` (MIT), `cannon-es` (MIT), `postprocessing` (Zlib),
`next`/`react`/`react-dom` (MIT) — all permissive; notices ship in
`public/THIRD-PARTY-LICENSES.txt`.

## Build tooling

Next.js (App Router, TypeScript) as a static export (`next.config.ts`:
`output: 'export'`, `basePath: '/MonoStack'` for GitHub Pages). To host it as
a normal Next.js server app — e.g. on Lily — drop those two options and use
`next start`. Deploys via `.github/workflows/deploy.yml` on push to `main`.
