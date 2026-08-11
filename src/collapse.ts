import * as CANNON from 'cannon-es';
import * as THREE from 'three';
import { BLOCK, PHYSICS, TRIM } from './config';
import { disposeBlock, type BlockHandle } from './blocks';
import { rectD, rectW } from './placement';

interface Piece {
  handle: BlockHandle;
  body: CANNON.Body;
  born: number;
}

// Physics is spectacle only: cut slabs and missed blocks tumble; placement
// math never touches this world.
export class Collapse {
  private world: CANNON.World | null = null;
  private pieces: Piece[] = [];
  private now = 0;

  private ensureWorld(): CANNON.World {
    if (!this.world) {
      this.world = new CANNON.World({ gravity: new CANNON.Vec3(0, PHYSICS.GRAVITY, 0) });
      const ground = new CANNON.Body({ type: CANNON.Body.STATIC, shape: new CANNON.Plane() });
      ground.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
      this.world.addBody(ground);
    }
    return this.world;
  }

  // Hand a layer over to physics. velocity = the block's travel velocity at
  // release; kick = outward separation direction on the travel axis (±1 | 0).
  add(handle: BlockHandle, axis: 'x' | 'z', velocity: number, kick: number): void {
    const world = this.ensureWorld();
    const body = new CANNON.Body({
      mass: 1,
      shape: new CANNON.Box(
        new CANNON.Vec3(rectW(handle.rect) / 2, BLOCK.HEIGHT / 2, rectD(handle.rect) / 2),
      ),
    });
    const p = handle.group.position;
    body.position.set(p.x, p.y, p.z);
    body.velocity.set(
      axis === 'x' ? velocity + kick * PHYSICS.SEPARATION_KICK : 0,
      1,
      axis === 'z' ? velocity + kick * PHYSICS.SEPARATION_KICK : 0,
    );
    const spin = (): number => (Math.random() - 0.5) * 2 * PHYSICS.SPIN;
    body.angularVelocity.set(spin(), spin() * 0.3, spin());
    world.addBody(body);
    this.pieces.push({ handle, body, born: this.now });
    while (this.pieces.length > TRIM.MAX_PIECES) this.cull(0);
  }

  step(dt: number): void {
    if (!this.world || this.pieces.length === 0) return;
    this.now += dt * 1000;
    this.world.step(1 / 60, dt, 3);
    for (let i = this.pieces.length - 1; i >= 0; i--) {
      const { handle, body, born } = this.pieces[i];
      handle.group.position.set(body.position.x, body.position.y, body.position.z);
      handle.group.quaternion.set(
        body.quaternion.x,
        body.quaternion.y,
        body.quaternion.z,
        body.quaternion.w,
      );
      if (this.now - born > TRIM.PIECE_LIFE_MS || body.position.y < -60) this.cull(i);
    }
  }

  private cull(i: number): void {
    const piece = this.pieces.splice(i, 1)[0];
    this.world?.removeBody(piece.body);
    disposeBlock(piece.handle);
  }

  reset(): void {
    while (this.pieces.length) this.cull(0);
  }
}
