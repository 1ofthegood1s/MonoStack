import { tickTweens } from './anim';
import { Collapse } from './collapse';
import { FX } from './fx';
import { Game } from './game';
import { Stage } from './scene';
import { UI } from './ui';

const stage = new Stage(document.getElementById('app')!);
const ui = new UI();
const collapse = new Collapse();
const fx = new FX(stage.scene, stage.camera);
const game = new Game(stage, ui, collapse, fx);

// Debug/test hooks for the headless smoke run.
(window as unknown as { __monostack: unknown }).__monostack = game.debug;

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
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
