import { tickTweens } from './anim';
import { Game } from './game';
import { Stage } from './scene';
import { UI } from './ui';

const stage = new Stage(document.getElementById('app')!);
const ui = new UI();
const game = new Game(stage, ui);

let last = performance.now();
function frame(now: number): void {
  const dtMs = Math.min(now - last, 50); // clamp tab-switch spikes
  last = now;
  game.update(dtMs / 1000);
  tickTweens(dtMs);
  stage.render();
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
