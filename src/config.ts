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
  ENTRY_CLEARANCE: 14, // spawn distance beyond the tower edge on the travel axis
  ENTRY_JITTER: 10, // extra random spawn distance — breaks timing memorization
} as const;

// Trim rules (decision 11 Aug 2026: pure trim, no streak regrowth — overrides
// the original no-trim brief and the audit gate, Renato's call): any
// non-perfect drop keeps only the overlap; the overhang breaks off.
export const TRIM = {
  MIN_FOOTPRINT: 2, // kept side shorter than this → counts as a total miss
  MAX_PIECES: 10, // live physics debris cap (oldest culled first)
  PIECE_LIFE_MS: 4000,
  MISS_OVERLAY_MS: 1400, // physics plays this long before the LOST overlay
} as const;

export const SCORING = {
  BASE: 10, // points per non-perfect placement
  PERFECT: 25, // × current streak, per perfect placement
} as const;

export const PHYSICS = {
  GRAVITY: -60, // world units/s² — scaled to 4-unit block heights
  SEPARATION_KICK: 9, // outward impulse for cut slabs
  SPIN: 2.0, // max random angular velocity for debris
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
// world scale; W and D follow from the brand proportions. Trimming erodes the
// footprint from this brand-exact start — only a perfect run rebuilds the
// true monolith.
export const SCALE = (4 * GAME.MAX_BLOCKS) / MONOLITH.H; // world units per SVG px
export const BLOCK = {
  HEIGHT: 4,
  W: MONOLITH.W * SCALE, // ≈ 59.77 — extent on the X (east) travel axis
  D: MONOLITH.D * SCALE, // ≈ 14.94 — extent on the Z (north) travel axis
} as const;

export const CAMERA = {
  FOV: 38,
  OFFSET: { x: 62, y: 34, z: 62 }, // fixed offset from the active layer center
  RISE_MS: 260, // eased one-block climb per placement
  END_PAN_MS: 3000,
  END_FOV: 44,
  END_DISTANCE: 215, // pull-back along the fixed view direction (translation only)
} as const;

export const FX_CONF = {
  FLASH_MS: 320,
  EDGE_LIGHT_STAGGER_MS: 45, // bottom-to-top illumination step in the end sequence
  SHAKE_TRIM: 0.9, // translation-only camera shake amplitude (world units)
  SHAKE_MISS: 1.8,
  BURST_PARTICLES: 40,
  BLOOM: { threshold: 0.72, smoothing: 0.2, intensity: 0.9 },
} as const;

export const AUDIO = {
  VOLUME: 0.16, // master gain
  MUTE_KEY: 'lily-monolith-muted',
} as const;

export const STORAGE_KEY = 'lily-monolith-best';
export const STORAGE_KEY_POINTS = 'lily-monolith-best-points';
