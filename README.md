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
npm run dev        # Vite dev server → http://localhost:5173
npm run build      # typecheck + production bundle in dist/
npm run preview    # serve the production bundle (at /MonoStack/)
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

- `index.html` — HUD + overlay markup and styles (colors via CSS variables
  injected from config)
- `src/main.ts` — bootstrap + frame loop (+ `window.__monostack` test hooks)
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

Dependencies: `three` (MIT), `cannon-es` (MIT), `postprocessing` (Zlib) —
all permissive, license banners preserved in the bundle.

## Build tooling

Plain Vite + TypeScript (`package.json`, `tsconfig.json`, `vite.config.ts` —
base is `/MonoStack/` for GitHub Pages; set to `/` for a domain root).
Deploys via `.github/workflows/deploy.yml` on push to `main`.
