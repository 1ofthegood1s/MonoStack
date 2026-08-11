import * as THREE from 'three';
import { BLOCK, GAME, MONOLITH, PALETTE, SCALE } from './config';
import { rectCX, rectCZ, rectD, rectW, type Rect } from './placement';

// Brand-true layers: each level is a 1/30 horizontal slice of the LILY Monolith
// solid (solid derivation, game block v3 — 10 Aug 2026). The front face carries
// the mark's crease, split into the two brand greens. With trimming, layers can
// be any sub-rect of the brand footprint — the crease is clamped to whatever
// front face survives, so a perfect run still reassembles the exact monolith.

export interface BlockHandle {
  group: THREE.Group;
  mats: THREE.MeshStandardMaterial[];
  level: number;
  rect: Rect; // tower-space footprint this geometry was built for
}

// Crease x at brand height y, in tower-space world units (centered on origin).
const creaseWorldX = (yBrand: number): number =>
  (MONOLITH.CREASE_BOTTOM_X +
    ((MONOLITH.CREASE_TOP_X - MONOLITH.CREASE_BOTTOM_X) * yBrand) / MONOLITH.H -
    MONOLITH.W / 2) *
  SCALE;

type V = [number, number, number];
const quad = (a: V, b: V, c: V, d: V): V[][] => [
  [a, b, c],
  [a, c, d],
];

// Build a layer for an arbitrary footprint rect. Geometry is centered on the
// rect (group.position carries the world placement) so travel/physics can move
// the group freely.
export function makeLayer(rect: Rect, level: number): BlockHandle {
  const hw = rectW(rect) / 2;
  const hd = rectD(rect) / 2;
  const hh = BLOCK.HEIGHT / 2;
  const layerHBrand = MONOLITH.H / GAME.MAX_BLOCKS;
  // Crease positions at this layer's bottom/top, local to the rect center,
  // clamped to the surviving front face (degenerate quads render nothing).
  const clamp = (x: number): number => Math.min(hw, Math.max(-hw, x - rectCX(rect)));
  const x0 = clamp(creaseWorldX((level - 1) * layerHBrand));
  const x1 = clamp(creaseWorldX(level * layerHBrand));

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
    for (const tri of tris) for (const v of tri) pos.push(...v);
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.computeVertexNormals();
    group.add(new THREE.Mesh(g, mat));
  };

  // Local coordinates, centered. CCW from outside.
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

  group.position.set(rectCX(rect), (level - 0.5) * BLOCK.HEIGHT, rectCZ(rect));
  return { group, mats: Object.values(mats), level, rect };
}

export function disposeBlock(b: BlockHandle): void {
  b.group.traverse((o) => {
    if (o instanceof THREE.Mesh) o.geometry.dispose();
  });
  b.mats.forEach((m) => m.dispose());
  b.group.removeFromParent();
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
