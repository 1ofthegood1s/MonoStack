import * as THREE from 'three';
import { BloomEffect, EffectComposer, EffectPass, RenderPass } from 'postprocessing';
import { BLOCK, CAMERA, FX_CONF, PALETTE } from './config';

// Renderer, camera, lights, backdrop, one bloom pass. The camera's orientation
// is fixed once in the constructor and never changes again — all later motion
// is translation/FOV. Bloom is threshold-gated so only bright lime (perfect
// flash, particles, end light-up) glows; base faces stay clean.
export class Stage {
  readonly renderer: THREE.WebGLRenderer;
  readonly scene: THREE.Scene;
  readonly camera: THREE.PerspectiveCamera;
  readonly rig: THREE.Group; // game motion moves the rig; shake moves the camera inside it
  readonly viewDir: THREE.Vector3; // the immutable look direction, unit length
  private composer: EffectComposer;

  constructor(container: HTMLElement) {
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    // 1.5 cap: bloom runs the frame through a composer, so retina-2x would
    // quadruple the fill cost — 1.5 keeps 60fps headroom on integrated GPUs.
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
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
    // Level-1 block center — the first block lands directly on the ground.
    const target = new THREE.Vector3(0, BLOCK.HEIGHT * 0.5, 0);
    this.camera.position.set(
      target.x + CAMERA.OFFSET.x,
      target.y + CAMERA.OFFSET.y,
      target.z + CAMERA.OFFSET.z,
    );
    this.camera.lookAt(target); // orientation set once, here, only
    this.viewDir = target.clone().sub(this.camera.position).normalize();

    // Rig: rises/pans translate the rig; FX shake nudges the camera's local
    // position around (0,0,0) — the two never fight over the same transform.
    this.rig = new THREE.Group();
    this.rig.position.copy(this.camera.position);
    this.camera.position.set(0, 0, 0);
    this.rig.add(this.camera);
    this.scene.add(this.rig);

    this.composer = new EffectComposer(this.renderer, {
      frameBufferType: THREE.HalfFloatType,
    });
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    this.composer.addPass(
      new EffectPass(
        this.camera,
        new BloomEffect({
          luminanceThreshold: FX_CONF.BLOOM.threshold,
          luminanceSmoothing: FX_CONF.BLOOM.smoothing,
          intensity: FX_CONF.BLOOM.intensity,
          mipmapBlur: true,
          levels: 5,
          radius: 0.7,
        }),
      ),
    );

    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.composer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  render(dt: number): void {
    this.composer.render(dt);
  }
}
