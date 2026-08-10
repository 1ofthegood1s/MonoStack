import * as THREE from 'three';
import { BLOCK, CAMERA, PALETTE } from './config';

// Renderer, camera, lights, backdrop. The camera's orientation is fixed once in
// the constructor and never changes again — all later motion is translation/FOV.
export class Stage {
  readonly renderer: THREE.WebGLRenderer;
  readonly scene: THREE.Scene;
  readonly camera: THREE.PerspectiveCamera;
  readonly viewDir: THREE.Vector3; // the immutable look direction, unit length

  constructor(container: HTMLElement) {
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor(PALETTE.bg);
    container.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();

    // Backdrop: solid black plus one faint grid — nothing else to draw.
    const grid = new THREE.GridHelper(600, 60, PALETTE.white10, PALETTE.white10);
    this.scene.add(grid);

    this.scene.add(new THREE.AmbientLight(PALETTE.white, 0.55));
    const sun = new THREE.DirectionalLight(PALETTE.white, 1.1);
    sun.position.set(60, 120, 40);
    this.scene.add(sun);

    this.camera = new THREE.PerspectiveCamera(
      CAMERA.FOV,
      window.innerWidth / window.innerHeight,
      0.1,
      2000,
    );
    // Level-1 block center: the foundation occupies [0, HEIGHT).
    const target = new THREE.Vector3(0, BLOCK.HEIGHT * 1.5, 0);
    this.camera.position.set(
      target.x + CAMERA.OFFSET.x,
      target.y + CAMERA.OFFSET.y,
      target.z + CAMERA.OFFSET.z,
    );
    this.camera.lookAt(target); // orientation set once, here, only
    this.viewDir = target.clone().sub(this.camera.position).normalize();

    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  render(): void {
    this.renderer.render(this.scene, this.camera);
  }
}
