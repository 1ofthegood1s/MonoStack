import { GAME, LAND_TOLERANCE } from './config';

export type Placement = 'perfect' | 'landed' | 'missed';

// offset = |block center − tower center| on the active axis. Placed blocks are
// always snapped to dead center, so the block below is always at 0. The landing
// band depends on the axis: the footprint is wide on X, shallow on Z.
export function resolvePlacement(offset: number, axis: 'x' | 'z'): Placement {
  if (offset <= GAME.PERFECT_TOLERANCE) return 'perfect';
  if (offset <= LAND_TOLERANCE[axis]) return 'landed';
  return 'missed';
}
