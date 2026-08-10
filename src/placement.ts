import { GAME } from './config';

export type Placement = 'perfect' | 'landed' | 'missed';

// offset = |block center − tower center| on the active axis. Placed blocks are
// always snapped to dead center, so the block below is always at 0.
export function resolvePlacement(offset: number): Placement {
  if (offset <= GAME.PERFECT_TOLERANCE) return 'perfect';
  if (offset <= GAME.LAND_TOLERANCE) return 'landed';
  return 'missed';
}
