import { makeBlock, styleFlash, stylePlaced, type BlockHandle } from './blocks';
import { BLOCK, CAMERA, FX, GAME } from './config';
import { delay, tween, linear } from './anim';
import { resolvePlacement } from './placement';
import { runEndSequence } from './endgame';
import { Score } from './score';
import type { Stage } from './scene';
import type { UI } from './ui';

type State = 'READY' | 'PLAYING' | 'RESOLVING' | 'WON' | 'LOST';

// Compass convention: north = −Z, east = +X. Odd levels enter from the north
// and ride the Z axis; even levels enter from the east and ride the X axis.
export class Game {
  private state: State = 'READY';
  private score = new Score();
  private placed: BlockHandle[] = [];
  private active: BlockHandle | null = null;
  private axis: 'x' | 'z' = 'z';
  private dir = 1;

  constructor(
    private stage: Stage,
    private ui: UI,
  ) {
    const foundation = makeBlock(0);
    stylePlaced(foundation);
    stage.scene.add(foundation.group);
    this.placed.push(foundation);

    ui.update(this.score);
    ui.showStart();

    window.addEventListener('pointerdown', () => this.onAction());
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        this.onAction();
      }
    });
  }

  private onAction(): void {
    if (this.state === 'READY') {
      this.ui.hideOverlays();
      this.state = 'PLAYING';
      this.spawn();
    } else if (this.state === 'PLAYING') {
      this.drop();
    }
    // RESOLVING / WON / LOST: input is frozen; overlays own the restart.
  }

  private spawn(): void {
    const level = this.score.blocks + 1;
    const block = makeBlock(level);
    if (level % 2 === 1) {
      this.axis = 'z';
      this.dir = 1;
      block.group.position.z = -GAME.TRAVEL_BOUND; // in from the north
    } else {
      this.axis = 'x';
      this.dir = -1;
      block.group.position.x = GAME.TRAVEL_BOUND; // in from the east
    }
    this.stage.scene.add(block.group);
    this.active = block;
  }

  // dt in seconds. Constant velocity, ping-pong between the travel bounds.
  update(dt: number): void {
    if (this.state !== 'PLAYING' || !this.active) return;
    const p = this.active.group.position;
    p[this.axis] += this.dir * GAME.SPEED * dt;
    if (Math.abs(p[this.axis]) > GAME.TRAVEL_BOUND) {
      p[this.axis] = Math.sign(p[this.axis]) * GAME.TRAVEL_BOUND;
      this.dir = -Math.sign(p[this.axis]);
    }
  }

  private drop(): void {
    const block = this.active!;
    this.active = null;
    this.state = 'RESOLVING';

    const offset = Math.abs(block.group.position[this.axis]);
    const result = resolvePlacement(offset);

    if (result === 'missed') {
      this.fall(block);
      return;
    }

    // Both perfect and landed snap to dead center — the footprint never changes.
    block.group.position.set(0, block.group.position.y, 0);
    this.placed.push(block);
    this.score.place(result === 'perfect');
    this.ui.update(this.score);

    if (result === 'perfect') {
      styleFlash(block);
      delay(FX.FLASH_MS, () => stylePlaced(block));
    } else {
      stylePlaced(block);
    }

    if (this.score.blocks >= GAME.MAX_BLOCKS) {
      this.state = 'WON';
      runEndSequence(this.stage, this.placed, this.ui, this.score);
      return;
    }

    // Camera climbs one block height so the next layer lands at the same
    // screen position — translation only.
    const fromY = this.stage.camera.position.y;
    tween(CAMERA.RISE_MS, (k) => (this.stage.camera.position.y = fromY + k * BLOCK.HEIGHT), {
      done: () => {
        this.state = 'PLAYING';
        this.spawn();
      },
    });
  }

  // Failed placement: the block keeps sliding past the tower, drops, tumbles.
  private fall(block: BlockHandle): void {
    const start = block.group.position.clone();
    const { axis, dir } = this;
    tween(
      FX.FALL_MS,
      (k) => {
        const t = (k * FX.FALL_MS) / 1000;
        block.group.position[axis] = start[axis] + dir * GAME.SPEED * t;
        block.group.position.y = start.y - 0.5 * FX.FALL_GRAVITY * t * t;
        block.group.rotation[axis === 'z' ? 'x' : 'z'] = dir * t * 2.5;
      },
      {
        ease: linear,
        done: () => {
          this.state = 'LOST';
          this.ui.showLost(this.score);
        },
      },
    );
  }
}
