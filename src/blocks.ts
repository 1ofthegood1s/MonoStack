import * as THREE from 'three';
import { BLOCK, GAME, MONOLITH, PALETTE, SCALE } from './config';

// Brand-true blocks: each level is a 1/30 horizontal slice of the LILY Monolith
// solid (solid derivation, game block v3 — 10 Aug 2026). The front face carries
// the mark's crease, split into the two brand greens; the crease interpolates
// per layer, so a completed tower reassembles the exact monolith slab.

export interface BlockHandle {
  group: THREE.Group;
  mats: THREE.MeshStandardMaterial[];
  level: number;
}

// Crease x at brand height y, centered on the footprint (−W/2 .. W/2).
const creaseX = (y: number): number =>
  MONOLITH.CREASE_BOTTOM_X +
  ((MONOLITH.CREASE_TOP_X - MONOLITH.CREASE_BOTTOM_X) * y) / MONOLITH.H -
  MONOLITH.W / 2;

type V = [number, number, number];
const quad = (a: V, b: V, c: V, d: V): V[][] => [
  [a, b, c],
  [a, c, d],
];

// Levels run 1..MAX_BLOCKS; the first block lands directly on the ground.
export function makeBlock(level: number): BlockHandle {
  const hw = MONOLITH.W / 2;
  const hd = MONOLITH.D / 2;
  const layerH = MONOLITH.H / GAME.MAX_BLOCKS;
  const hh = layerH / 2;
  // Crease positions at this layer's bottom and top, in local coordinates.
  const x0 = creaseX((level - 1) * layerH);
  const x1 = creaseX(level * layerH);

  const mk = (hex: string, roughness: number) =>
    new THREE.MeshStandardMaterial({
      color: hex,
      roughness,
      metalness: 0.05,
      emissive: new THREE.Color(PALETTE.lime),
      emissiveIntensity: 0,
    });
  const mats = {
    front: mk(PALETTE.neonFront, 0.6),
    facet: mk(PALETTE.limeDeep, 0.6),
    side: mk(PALETTE.neonSide, 0.65),
    top: mk(PALETTE.limeBright, 0.55),
    bottom: mk(PALETTE.limeInk, 0.9),
  };

  const group = new THREE.Group();
  const add = (mat: THREE.MeshStandardMaterial, tris: V[][]): void => {
    const pos: number[] = [];
    for (const tri of tris) for (const v of tri) pos.push(...v.map((c) => c * SCALE));
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.computeVertexNormals();
    group.add(new THREE.Mesh(g, mat));
  };

  // Local brand-unit coordinates, y centered on the layer. CCW from outside.
  const LT: V = [-hw, hh, hd], LB: V = [-hw, -hh, hd];
  const RB: V = [hw, -hh, hd], RT: V = [hw, hh, hd];
  const lt: V = [-hw, hh, -hd], lb: V = [-hw, -hh, -hd];
  const rb: V = [hw, -hh, -hd], rt: V = [hw, hh, -hd];
  const T: V = [x1, hh, hd], B: V = [x0, -hh, hd];

  add(mats.front, quad(LT, LB, B, T)); // front, left of the crease
  add(mats.facet, quad(T, B, RB, RT)); // front, right of the crease
  add(mats.side, quad(rt, rb, lb, lt)); // back
  add(mats.side, quad(RT, RB, rb, rt)); // right wall
  add(mats.side, quad(lt, lb, LB, LT)); // left wall
  add(mats.top, quad(lt, LT, RT, rt));
  add(mats.bottom, quad(LB, lb, rb, RB));

  group.position.y = (level - 0.5) * BLOCK.HEIGHT;
  return { group, mats: Object.values(mats), level };
}

export function stylePlaced(b: BlockHandle): void {
  b.mats.forEach((m) => (m.emissiveIntensity = 0));
}

export function styleFlash(b: BlockHandle): void {
  b.mats.forEach((m) => (m.emissiveIntensity = 0.55));
}

export function styleLit(b: BlockHandle): void {
  b.mats.forEach((m) => (m.emissiveIntensity = 0.3));
}
