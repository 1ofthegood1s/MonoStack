import { tickTweens } from './anim';
import { Collapse } from './collapse';
import { FX } from './fx';
import { Game } from './game';
import { Stage } from './scene';
import { UI } from './ui';

// Client-only bootstrap (dynamically imported after mount — nothing here runs
// during prerender). Returns a stop function for the frame loop.
export function boot(host: HTMLElement): () => void {
  const stage = new Stage(host);
  const ui = new UI();
  const collapse = new Collapse();
  const fx = new FX(stage.scene, stage.camera);
  const game = new Game(stage, ui, collapse, fx);

  // Debug/test hooks for the headless smoke run.
  (window as unknown as { __monostack: unknown }).__monostack = game.debug;

  let raf = 0;
  let last = performance.now();
  function frame(now: number): void {
    const dtMs = Math.min(now - last, 50); // clamp tab-switch spikes
    last = now;
    const dt = dtMs / 1000;
    game.update(dt);
    tickTweens(dtMs);
    collapse.step(dt);
    fx.update(dt);
    stage.render(dt);
    raf = requestAnimationFrame(frame);
  }
  raf = requestAnimationFrame(frame);
  return () => cancelAnimationFrame(raf);
}
