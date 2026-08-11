// Minimal tween runner, ticked once per frame from the main loop.

type Ease = (t: number) => number;

export const easeInOutCubic: Ease = (t) =>
  t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
export const linear: Ease = (t) => t;

interface Tween {
  elapsed: number;
  ms: number;
  update: (k: number) => void;
  done?: () => void;
  ease: Ease;
}

const active: Tween[] = [];

export function tween(
  ms: number,
  update: (k: number) => void,
  opts: { ease?: Ease; done?: () => void } = {},
): void {
  active.push({ elapsed: 0, ms, update, done: opts.done, ease: opts.ease ?? easeInOutCubic });
}

export function delay(ms: number, done: () => void): void {
  tween(ms, () => {}, { ease: linear, done });
}

// Cancel everything in flight (restart) — pending done() callbacks never fire.
export function clearTweens(): void {
  active.length = 0;
}

export function tickTweens(dtMs: number): void {
  for (let i = active.length - 1; i >= 0; i--) {
    const tw = active[i];
    tw.elapsed += dtMs;
    const k = Math.min(1, tw.elapsed / tw.ms);
    tw.update(tw.ease(k));
    if (k === 1) {
      active.splice(i, 1);
      tw.done?.();
    }
  }
}
