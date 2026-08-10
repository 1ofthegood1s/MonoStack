import * as THREE from 'three';
import { BLOCK, PALETTE } from './config';

// One shared geometry — every block is identical, 16 × 16 × 4, forever.
const geometry = new THREE.BoxGeometry(BLOCK.SIZE, BLOCK.HEIGHT, BLOCK.SIZE);
const edgeGeometry = new THREE.EdgesGeometry(geometry);

export interface BlockHandle {
  group: THREE.Group;
  face: THREE.MeshLambertMaterial;
  edge: THREE.LineBasicMaterial;
  level: number;
}

// Level 0 is the foundation; levels 1..MAX_BLOCKS are playable.
export function makeBlock(level: number): BlockHandle {
  // Subtle per-level banding: alternate the two dark surface tones.
  const face = new THREE.MeshLambertMaterial({
    color: level % 2 === 0 ? PALETTE.card : PALETTE.panel,
  });
  const edge = new THREE.LineBasicMaterial({ color: PALETTE.lime });
  const group = new THREE.Group();
  group.add(new THREE.Mesh(geometry, face), new THREE.LineSegments(edgeGeometry, edge));
  group.position.y = level * BLOCK.HEIGHT + BLOCK.HEIGHT / 2;
  return { group, face, edge, level };
}

export function stylePlaced(b: BlockHandle): void {
  b.edge.color.set(PALETTE.limeDeep);
  b.face.emissive.set(PALETTE.bg);
  b.face.emissiveIntensity = 0;
}

export function styleFlash(b: BlockHandle): void {
  b.edge.color.set(PALETTE.limeBright);
  b.face.emissive.set(PALETTE.lime);
  b.face.emissiveIntensity = 0.35;
}

export function styleLit(b: BlockHandle): void {
  b.edge.color.set(PALETTE.limeBright);
  b.face.emissive.set(PALETTE.lime);
  b.face.emissiveIntensity = 0.22;
}
