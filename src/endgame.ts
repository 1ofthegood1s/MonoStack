import * as THREE from 'three';
import { styleLit, type BlockHandle } from './blocks';
import { BLOCK, CAMERA, FX, GAME } from './config';
import { delay, tween } from './anim';
import type { Stage } from './scene';
import type { Score } from './score';
import type { UI } from './ui';

// The win sequence. Input is already frozen (game state is WON before this runs).
// The camera pans out and slightly down by TRANSLATION + FOV only — its
// orientation was fixed at boot and stage.viewDir never changes.
export function runEndSequence(
  stage: Stage,
  placed: BlockHandle[],
  ui: UI,
  score: Score,
): void {
  // Frame the full monolith: put its midpoint END_DISTANCE away along the
  // existing view direction.
  const towerMid = new THREE.Vector3(0, (GAME.MAX_BLOCKS * BLOCK.HEIGHT) / 2, 0);
  const endPos = towerMid.clone().sub(stage.viewDir.clone().multiplyScalar(CAMERA.END_DISTANCE));
  const fromPos = stage.camera.position.clone();
  const fromFov = stage.camera.fov;

  tween(
    CAMERA.END_PAN_MS,
    (k) => {
      stage.camera.position.lerpVectors(fromPos, endPos, k);
      stage.camera.fov = fromFov + (CAMERA.END_FOV - fromFov) * k;
      stage.camera.updateProjectionMatrix();
    },
    {
      done: () => {
        // Edges illuminate bottom-to-top, then the title card.
        placed.forEach((b, i) =>
          delay(i * FX.EDGE_LIGHT_STAGGER_MS, () => styleLit(b)),
        );
        delay(placed.length * FX.EDGE_LIGHT_STAGGER_MS + 400, () => ui.showWon(score));
      },
    },
  );
}
