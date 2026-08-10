# LILY Monolith

A single-screen 3D stacking game. Stack 30 identical blocks — each a 1/30
horizontal slice of the brand-exact LILY Monolith solid (front face 1 : 2.008,
depth W/4, the mark's crease split into the two brand greens) — to reassemble
the monolith. Static camera (translation + FOV only, never rotates), constant
block speed, LILY neon palette.

## Run

```sh
npm install
npm run dev        # Vite dev server → http://localhost:5173
npm run build      # typecheck + production bundle in dist/
npm run preview    # serve the production bundle
```

Input: tap, click, or Space drops the active block. Restart via the overlay
button (game state is small enough that restart = reload).

## Tune difficulty

Everything tunable lives in `src/config.ts` — nothing else holds a constant:

- `GAME.PERFECT_TOLERANCE` — max center offset that still counts as perfect.
- `GAME.LAND_FRACTION` — fraction of the footprint that must overlap to land
  (0.5 = half); beyond the derived per-axis `LAND_TOLERANCE` the block falls
  and the run ends. The footprint is wide on X, shallow on Z, so the north
  (Z-axis) levels are the tighter ones.
- `GAME.SPEED` / `GAME.TRAVEL_BOUND` — block velocity and per-axis range.
- `GAME.MAX_BLOCKS`, `MONOLITH.*` (brand solid dimensions — change only with a
  new derivation), `CAMERA.*`, `FX.*`, and the full `PALETTE`.

## Reward placeholder

`index.html` → the win overlay (`#overlay-won`) contains
`<!-- REWARD_PLACEHOLDER -->` and an empty labeled container `#reward-slot`.
Wire the reward content there; it appears after the end-game sequence
(pan-out → bottom-to-top edge illumination → LILY title card).

## Structure

- `index.html` — HUD + overlay markup and styles (colors via CSS variables
  injected from config)
- `src/main.ts` — bootstrap + frame loop
- `src/config.ts` — every tunable constant and the palette
- `src/game.ts` — state machine (`READY → PLAYING → RESOLVING → WON | LOST`),
  spawner, mover, drop resolution
- `src/placement.ts` — three-band tolerance resolver
- `src/score.ts` — block count, perfect streak, `localStorage` high score
  (`lily-monolith-best`)
- `src/scene.ts` — renderer, fixed-orientation camera, lights, grid backdrop
- `src/blocks.ts` — shared block geometry + edge/face styles
- `src/endgame.ts` — win sequence (camera pan by translation + FOV only)
- `src/ui.ts` — HUD and overlays
- `src/anim.ts` — minimal tween runner

## Assets

Everything is procedural or system-provided — no imported models, textures,
or font files:

| Asset | Source |
|---|---|
| Block geometry | Procedural `BufferGeometry`: per-level slice of the LILY Monolith solid, derived from `monolith-game-geometry.js` (LILY solid derivation, 10 Aug 2026 — brand-owned) |
| Backdrop | Solid black clear color + one `THREE.GridHelper` |
| Lighting | One `THREE.DirectionalLight` + one `THREE.AmbientLight`; no shadow maps, no post-processing |
| Font | Menlo (system monospace — the LILY brand mono per `brand-tokens.mjs`) |
| Color tokens | Copied verbatim from `~/Projects/lily-marketing/visuals/brand-tokens.mjs` (neon rebrand, 9 Aug 2026): bg `#000000`, panel `#0A0A0B`, card `#141416`, hairline `#232326`, white steps `#FFFFFF`/`#8C8C8C`/`#666666`/`#1A1A1A`, lime `#B8E62A`, limeBright `#D4F43A`, limeDeep `#8FB215`, limeInk `#141A00`; plus two solid-derivation face tones that are exact 50% sRGB blends of adjacent tokens: `#B2D328`, `#A4CC20` |

## Build tooling

Plain Vite + TypeScript (`package.json`, `tsconfig.json`); no other config
files are required.
