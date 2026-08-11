import { TRIM } from './config';

// Footprint rectangle in tower-space world units.
export interface Rect {
  x0: number;
  x1: number;
  z0: number;
  z1: number;
}

export const rectW = (r: Rect): number => r.x1 - r.x0;
export const rectD = (r: Rect): number => r.z1 - r.z0;
export const rectCX = (r: Rect): number => (r.x0 + r.x1) / 2;
export const rectCZ = (r: Rect): number => (r.z0 + r.z1) / 2;

export const translateRect = (r: Rect, axis: 'x' | 'z', by: number): Rect =>
  axis === 'x'
    ? { ...r, x0: r.x0 + by, x1: r.x1 + by }
    : { ...r, z0: r.z0 + by, z1: r.z1 + by };

export type TrimResult =
  | { kind: 'perfect' }
  | { kind: 'trim'; kept: Rect; cut: Rect }
  | { kind: 'miss' };

// Pure trim resolution (decision 11 Aug 2026): perfect snaps clean; anything
// else keeps only the overlap with the tower top and sheds the overhang; no
// overlap (or a sliver below MIN_FOOTPRINT) ends the run.
export function resolveTrim(
  block: Rect,
  top: Rect,
  axis: 'x' | 'z',
  perfectTol: number,
): TrimResult {
  const [bLo, bHi, tLo, tHi] =
    axis === 'x' ? [block.x0, block.x1, top.x0, top.x1] : [block.z0, block.z1, top.z0, top.z1];
  const offset = (bLo + bHi) / 2 - (tLo + tHi) / 2;
  if (Math.abs(offset) <= perfectTol) return { kind: 'perfect' };

  const kLo = Math.max(bLo, tLo);
  const kHi = Math.min(bHi, tHi);
  if (kHi - kLo < TRIM.MIN_FOOTPRINT) return { kind: 'miss' };

  const cutLo = offset > 0 ? kHi : bLo;
  const cutHi = offset > 0 ? bHi : kLo;
  const withSpan = (lo: number, hi: number): Rect =>
    axis === 'x' ? { ...block, x0: lo, x1: hi } : { ...block, z0: lo, z1: hi };
  return { kind: 'trim', kept: withSpan(kLo, kHi), cut: withSpan(cutLo, cutHi) };
}
