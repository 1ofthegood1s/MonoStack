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
} as const;

export const BLOCK = {
  SIZE: 16, // footprint (x and z) — constant; never scaled, trimmed, or sliced
  HEIGHT: 4,
} as const;

export const GAME = {
  MAX_BLOCKS: 30,
  SPEED: 30, // units/second — identical for every block, no ramping
  TRAVEL_BOUND: 26, // oscillation half-range around the tower's center axis
  PERFECT_TOLERANCE: 1.0, // offset ≤ this → perfect: snap + flash + streak
  LAND_TOLERANCE: 8.0, // offset ≤ this → lands (snapped to center); beyond → falls
} as const;

export const CAMERA = {
  FOV: 38,
  OFFSET: { x: 36, y: 20, z: 36 }, // fixed offset from the active layer center
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
