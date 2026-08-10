# LILY Monolith

A single-screen 3D stacking game. Stack 30 identical 16 × 16 × 4 blocks to
assemble the LILY monolith. Static camera (translation + FOV only, never
rotates), constant block speed, LILY neon palette.

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
- `GAME.LAND_TOLERANCE` — max offset that still lands; beyond it the block
  falls and the run ends. (8 = half the footprint.)
- `GAME.SPEED` / `GAME.TRAVEL_BOUND` — block velocity and oscillation range.
- `GAME.MAX_BLOCKS`, `CAMERA.*` (offsets, rise, end-pan), `FX.*` (flash, fall,
  edge-light stagger), and the full `PALETTE`.

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
| Block geometry | `THREE.BoxGeometry(16, 4, 16)` + `THREE.EdgesGeometry`, shared by all blocks |
| Backdrop | Solid black clear color + one `THREE.GridHelper` |
| Lighting | One `THREE.DirectionalLight` + one `THREE.AmbientLight`; no shadow maps, no post-processing |
| Font | Menlo (system monospace — the LILY brand mono per `brand-tokens.mjs`) |
| Color tokens | Copied verbatim from `~/Projects/lily-marketing/visuals/brand-tokens.mjs` (neon rebrand, 9 Aug 2026): bg `#000000`, panel `#0A0A0B`, card `#141416`, hairline `#232326`, white steps `#FFFFFF`/`#8C8C8C`/`#666666`/`#1A1A1A`, lime `#B8E62A`, limeBright `#D4F43A`, limeDeep `#8FB215`, limeInk `#141A00` |

## Build tooling

Plain Vite + TypeScript (`package.json`, `tsconfig.json`); no other config
files are required.
