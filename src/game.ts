import * as THREE from 'three';
import { disposeBlock, makeLayer, styleFlash, stylePlaced, type BlockHandle } from './blocks';
import { BLOCK, CAMERA, FX_CONF, GAME, TRIM } from './config';
import { clearTweens, delay, tween } from './anim';
import {
  rectCX,
  rectCZ,
  rectD,
  rectW,
  resolveTrim,
  translateRect,
  type Rect,
} from './placement';
import { runEndSequence } from './endgame';
import { ensureAudio, sfx } from './audio';
import { Score } from './score';
import type { Collapse } from './collapse';
import type { FX } from './fx';
import type { Stage } from './scene';
import type { UI } from './ui';

type State = 'READY' | 'PLAYING' | 'RESOLVING' | 'WON' | 'LOST';

const brandRect = (): Rect => ({
  x0: -BLOCK.W / 2,
  x1: BLOCK.W / 2,
  z0: -BLOCK.D / 2,
  z1: BLOCK.D / 2,
});

// Compass convention: north = −Z, east = +X. Odd levels enter from the north
// and ride the Z axis; even levels ride X from the east. Trimming (pure, no
// regrowth — 11 Aug decision) erodes the top footprint; entry distance and
// oscillation range follow the surviving footprint, so runs tighten naturally.
export class Game {
  private state: State = 'READY';
  private score = new Score();
  private placed: BlockHandle[] = [];
  private active: BlockHandle | null = null;
  private topRect: Rect = brandRect();
  private axis: 'x' | 'z' = 'z';
  private dir = 1;
  private bound = 0; // this level's oscillation half-range around the top center
  private camHome: THREE.Vector3;
  private followX = 0; // camera's accumulated tower-drift follow
  private followZ = 0;

  constructor(
    private stage: Stage,
    private ui: UI,
    private collapse: Collapse,
    private fx: FX,
  ) {
    this.camHome = stage.rig.position.clone();
    ui.update(this.score);
    ui.showStart();
    ui.onRestart = () => this.reset();
    window.addEventListener('pointerdown', () => this.onAction());
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        this.onAction();
      }
    });
  }

  private onAction(): void {
    ensureAudio();
    if (this.state === 'READY') {
      this.ui.hideOverlays();
      this.state = 'PLAYING';
      this.spawn();
    } else if (this.state === 'PLAYING') {
      this.drop();
    }
    // RESOLVING / WON / LOST: input is frozen; overlays own the restart.
  }

  private topCenter(): number {
    return this.axis === 'z' ? rectCZ(this.topRect) : rectCX(this.topRect);
  }

  private spawn(): void {
    const level = this.score.blocks + 1;
    const block = makeLayer(this.topRect, level);
    this.axis = level % 2 === 1 ? 'z' : 'x';
    const halfExt = (this.axis === 'z' ? rectD(this.topRect) : rectW(this.topRect)) / 2;
    this.bound = halfExt + GAME.ENTRY_CLEARANCE + Math.random() * GAME.ENTRY_JITTER;
    this.dir = this.axis === 'z' ? 1 : -1; // toward the tower center
    block.group.position[this.axis] -= this.dir * this.bound;
    this.stage.scene.add(block.group);
    this.active = block;
  }

  // dt in seconds. Constant velocity, ping-pong around the top rect center.
  update(dt: number): void {
    if (this.state !== 'PLAYING' || !this.active) return;
    const p = this.active.group.position;
    let rel = p[this.axis] - this.topCenter() + this.dir * GAME.SPEED * dt;
    if (Math.abs(rel) > this.bound) {
      rel = Math.sign(rel) * this.bound;
      this.dir = -Math.sign(rel);
    }
    p[this.axis] = this.topCenter() + rel;
  }

  private drop(): void {
    const block = this.active!;
    this.active = null;
    this.state = 'RESOLVING';
    sfx.drop();

    const travel = block.group.position[this.axis] - this.topCenter();
    const blockRect = translateRect(this.topRect, this.axis, travel);
    const result = resolveTrim(blockRect, this.topRect, this.axis, GAME.PERFECT_TOLERANCE);

    if (result.kind === 'miss') {
      this.collapse.add(block, this.axis, this.dir * GAME.SPEED, Math.sign(travel) || this.dir);
      sfx.miss();
      this.fx.shake(FX_CONF.SHAKE_MISS);
      this.fx.vibrate(120);
      delay(TRIM.MISS_OVERLAY_MS, () => {
        this.state = 'LOST';
        this.ui.showLost(this.score);
      });
      return;
    }

    let placedBlock: BlockHandle;
    if (result.kind === 'perfect') {
      block.group.position[this.axis] = this.topCenter(); // snap clean
      placedBlock = block;
      this.score.place(true);
      styleFlash(placedBlock);
      delay(FX_CONF.FLASH_MS, () => stylePlaced(placedBlock));
      this.fx.burst(
        placedBlock.group.position.clone().add(new THREE.Vector3(0, BLOCK.HEIGHT / 2, 0)),
      );
      sfx.perfect(this.score.streak);
      this.fx.vibrate(15);
    } else {
      // Trim: keep the overlap, shed the overhang to physics.
      placedBlock = makeLayer(result.kept, block.level);
      const cut = makeLayer(result.cut, block.level);
      this.stage.scene.add(placedBlock.group, cut.group);
      disposeBlock(block);
      this.collapse.add(cut, this.axis, 0, Math.sign(travel));
      this.topRect = result.kept;
      this.score.place(false);
      sfx.trim();
      this.fx.shake(FX_CONF.SHAKE_TRIM);
      this.fx.vibrate(40);
    }
    this.placed.push(placedBlock);
    this.ui.update(this.score);

    if (this.score.blocks >= GAME.MAX_BLOCKS) {
      this.state = 'WON';
      sfx.win();
      runEndSequence(this.stage, this.placed, this.ui, this.score);
      return;
    }

    // Camera climbs one block and follows the (possibly drifted) top center —
    // translation only, so the next layer lands at the same screen position.
    const from = this.stage.rig.position.clone();
    const dx = rectCX(this.topRect) - this.followX;
    const dz = rectCZ(this.topRect) - this.followZ;
    this.followX += dx;
    this.followZ += dz;
    tween(
      CAMERA.RISE_MS,
      (k) => {
        this.stage.rig.position.set(
          from.x + k * dx,
          from.y + k * BLOCK.HEIGHT,
          from.z + k * dz,
        );
      },
      {
        done: () => {
          this.state = 'PLAYING';
          this.spawn();
        },
      },
    );
  }

  // Instant in-place restart — no page reload.
  reset(): void {
    clearTweens();
    this.collapse.reset();
    this.fx.reset();
    for (const b of this.placed) disposeBlock(b);
    this.placed = [];
    if (this.active) {
      disposeBlock(this.active);
      this.active = null;
    }
    this.topRect = brandRect();
    this.followX = 0;
    this.followZ = 0;
    this.score = new Score();
    this.stage.rig.position.copy(this.camHome);
    this.stage.camera.fov = CAMERA.FOV;
    this.stage.camera.updateProjectionMatrix();
    this.ui.update(this.score);
    this.ui.hideOverlays();
    this.state = 'READY';
    this.ui.showStart();
  }

  // Debug/test hooks (used by the headless smoke test).
  debug = {
    offset: (): number | null =>
      this.active ? this.active.group.position[this.axis] - this.topCenter() : null,
    footprint: (): { w: number; d: number } => ({
      w: rectW(this.topRect),
      d: rectD(this.topRect),
    }),
    act: (): void => this.onAction(),
    state: (): string => this.state,
  };
}
