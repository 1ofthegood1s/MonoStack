import * as THREE from 'three';
import { FX_CONF, PALETTE, PHYSICS } from './config';

interface Burst {
  points: THREE.Points;
  mat: THREE.PointsMaterial;
  vel: Float32Array;
  age: number;
}

const BURST_LIFE = 0.7; // seconds

// Zero-dep juice: lime particle bursts and a translation-only camera shake.
// The shake writes the camera's LOCAL position inside the stage rig (x/z
// only), so it composes cleanly with rig tweens and never rotates anything.
export class FX {
  private bursts: Burst[] = [];
  private shakeAmp = 0;

  constructor(
    private scene: THREE.Scene,
    private camera: THREE.PerspectiveCamera,
  ) {}

  burst(at: THREE.Vector3): void {
    const n = FX_CONF.BURST_PARTICLES;
    const pos = new Float32Array(n * 3);
    const vel = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      pos.set([at.x, at.y, at.z], i * 3);
      const a = Math.random() * Math.PI * 2;
      const r = 8 + Math.random() * 14;
      vel.set([Math.cos(a) * r, 6 + Math.random() * 14, Math.sin(a) * r], i * 3);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({
      color: PALETTE.limeBright,
      size: 1.1,
      transparent: true,
      opacity: 1,
      depthWrite: false,
    });
    const points = new THREE.Points(g, mat);
    this.scene.add(points);
    this.bursts.push({ points, mat, vel, age: 0 });
  }

  shake(amp: number): void {
    this.shakeAmp = Math.max(this.shakeAmp, amp);
  }

  vibrate(ms: number): void {
    navigator.vibrate?.(ms);
  }

  update(dt: number): void {
    for (let i = this.bursts.length - 1; i >= 0; i--) {
      const b = this.bursts[i];
      b.age += dt;
      const p = b.points.geometry.getAttribute('position') as THREE.BufferAttribute;
      const arr = p.array as Float32Array;
      for (let j = 0; j < arr.length; j += 3) {
        b.vel[j + 1] += PHYSICS.GRAVITY * 0.6 * dt;
        arr[j] += b.vel[j] * dt;
        arr[j + 1] += b.vel[j + 1] * dt;
        arr[j + 2] += b.vel[j + 2] * dt;
      }
      p.needsUpdate = true;
      b.mat.opacity = Math.max(0, 1 - b.age / BURST_LIFE);
      if (b.age >= BURST_LIFE) {
        this.scene.remove(b.points);
        b.points.geometry.dispose();
        b.mat.dispose();
        this.bursts.splice(i, 1);
      }
    }
    if (this.shakeAmp > 0.01) {
      this.camera.position.set(
        (Math.random() - 0.5) * 2 * this.shakeAmp,
        0,
        (Math.random() - 0.5) * 2 * this.shakeAmp,
      );
      this.shakeAmp *= Math.max(0, 1 - dt * 7);
    } else if (this.shakeAmp > 0) {
      this.camera.position.set(0, 0, 0);
      this.shakeAmp = 0;
    }
  }

  reset(): void {
    this.camera.position.set(0, 0, 0);
    this.shakeAmp = 0;
    for (const b of this.bursts) {
      this.scene.remove(b.points);
      b.points.geometry.dispose();
      b.mat.dispose();
    }
    this.bursts = [];
  }
}
