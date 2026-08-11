import * as THREE from 'three';
import { styleLit, type BlockHandle } from './blocks';
import { BLOCK, CAMERA, FX_CONF, GAME } from './config';
import { delay, tween } from './anim';
import type { Stage } from './scene';
import type { Score } from './score';
import type { UI } from './ui';

// The win sequence. Input is already frozen (game state is WON before this
// runs). The camera pans out and slightly down by TRANSLATION + FOV only —
// orientation was fixed at boot and stage.viewDir never changes. Trimmed runs
// erode the tower off-axis, so the framing centers on the surviving bbox.
export function runEndSequence(
  stage: Stage,
  placed: BlockHandle[],
  ui: UI,
  score: Score,
): void {
  const x0 = Math.min(...placed.map((b) => b.rect.x0));
  const x1 = Math.max(...placed.map((b) => b.rect.x1));
  const z0 = Math.min(...placed.map((b) => b.rect.z0));
  const z1 = Math.max(...placed.map((b) => b.rect.z1));
  const towerMid = new THREE.Vector3(
    (x0 + x1) / 2,
    (GAME.MAX_BLOCKS * BLOCK.HEIGHT) / 2,
    (z0 + z1) / 2,
  );
  const endPos = towerMid.clone().sub(stage.viewDir.clone().multiplyScalar(CAMERA.END_DISTANCE));
  const fromPos = stage.rig.position.clone();
  const fromFov = stage.camera.fov;

  tween(
    CAMERA.END_PAN_MS,
    (k) => {
      stage.rig.position.lerpVectors(fromPos, endPos, k);
      stage.camera.fov = fromFov + (CAMERA.END_FOV - fromFov) * k;
      stage.camera.updateProjectionMatrix();
    },
    {
      done: () => {
        // Edges illuminate bottom-to-top, then the title card.
        placed.forEach((b, i) =>
          delay(i * FX_CONF.EDGE_LIGHT_STAGGER_MS, () => styleLit(b)),
        );
        delay(placed.length * FX_CONF.EDGE_LIGHT_STAGGER_MS + 400, () => ui.showWon(score));
      },
    },
  );
}
