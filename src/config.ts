// Every tunable constant in one place. Change values here, never in game logic.
//
// Colors are the official LILY neon palette, copied verbatim from the canonical
// token file: ~/Projects/lily-marketing/visuals/brand-tokens.mjs (rebrand 9 Aug 2026).
// Brand rule: black background, white text, one neon-lime cluster per surface.

export const PALETTE = {
  bg: '#000000',
  panel: '#0A0A0B',
  card: '#141416',
  hairline: '#232326',
  white: '#FFFFFF',
  white55: '#8C8C8C',
  white40: '#666666',
  white10: '#1A1A1A',
  lime: '#B8E62A', // --color-accent on lilylabs.io — the canonical value
  limeBright: '#D4F43A',
  limeDeep: '#8FB215',
  limeInk: '#141A00',
  // Monolith solid face tones — from the solid derivation (monolith-game-geometry.js,
  // 10 Aug 2026). Both are exact 50% sRGB blends of adjacent tokens:
  neonFront: '#B2D328', // limeDeep · limeBright
  neonSide: '#A4CC20', // lime · limeDeep
} as const;

export const GAME = {
  MAX_BLOCKS: 30,
  SPEED: 30, // units/second — identical for every block, no ramping
  PERFECT_TOLERANCE: 1.0, // offset ≤ this → perfect: snap + flash + streak
  LAND_FRACTION: 0.5, // land while ≥ half the footprint overlaps on the axis
  TRAVEL_BOUND: { x: 75, z: 32 }, // oscillation half-range per travel axis
} as const;

// The LILY Monolith solid — brand-exact dimensions in SVG px, from the solid
// derivation (game block v3): front face = the mark's bbox (1 : 2.008),
// depth = W/4, front face split along the mark's crease.
export const MONOLITH = {
  W: 142.31,
  H: 285.74,
  D: 35.58,
  CREASE_TOP_X: 64.238, // crease x at the top edge (0..W space)
  CREASE_BOTTOM_X: 99.1535, // crease x at the base
} as const;

// Each level is a 1/30 horizontal slice of the solid. BLOCK.HEIGHT sets the
// world scale; W and D follow from the brand proportions.
export const SCALE = (4 * GAME.MAX_BLOCKS) / MONOLITH.H; // world units per SVG px
export const BLOCK = {
  HEIGHT: 4,
  W: MONOLITH.W * SCALE, // ≈ 59.77 — extent on the X (east) travel axis
  D: MONOLITH.D * SCALE, // ≈ 14.94 — extent on the Z (north) travel axis
} as const;

// offset ≤ this → lands (snapped to center); beyond → the block falls.
export const LAND_TOLERANCE = {
  x: BLOCK.W * GAME.LAND_FRACTION,
  z: BLOCK.D * GAME.LAND_FRACTION,
} as const;

export const CAMERA = {
  FOV: 38,
  OFFSET: { x: 62, y: 34, z: 62 }, // fixed offset from the active layer center
  RISE_MS: 260, // eased one-block climb per placement
  END_PAN_MS: 3000,
  END_FOV: 44,
  END_DISTANCE: 215, // pull-back along the fixed view direction (translation only)
} as const;

export const FX = {
  FLASH_MS: 320,
  FALL_MS: 1200,
  FALL_GRAVITY: 160, // units/s² for the failed-block drop
  EDGE_LIGHT_STAGGER_MS: 45, // bottom-to-top illumination step in the end sequence
} as const;

export const STORAGE_KEY = 'lily-monolith-best';
