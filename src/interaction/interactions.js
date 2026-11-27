import * as THREE from 'three/webgpu';

const REACH = 2.5;
const SCREEN_CENTER = new THREE.Vector2(0, 0);

// Finds what the player is looking at and handles "E to interact".
// An interactable is { object, title, body, onInteract? }.
// The ray is cast against the whole scene so walls and other props block what's behind them.
export class Interactions {
  constructor(camera, scene, interactables, hud) {
    this.camera = camera;
    this.scene = scene;
    this.hud = hud;
    this.raycaster = new THREE.Raycaster();
    this.raycaster.far = REACH;
    this.raycaster.params.Line.threshold = 0.01;
    this.byObject = new Map(interactables.map((i) => [i.object, i]));
    this.current = null;
  }

  update() {
    if (this.hud.isInspecting) return;

    this.raycaster.setFromCamera(SCREEN_CENTER, this.camera);
    const hit = this.raycaster.intersectObject(this.scene, true).find((h) => h.object.isMesh);
    this.current = hit ? this.findInteractable(hit.object) : null;

    if (this.current) this.hud.showPrompt(this.hud.touch ? this.current.title : `[E] ${this.current.title}`);
    else this.hud.hidePrompt();
  }

  interact() {
    if (this.hud.isInspecting) {
      this.hud.closeInspect();
    } else if (this.current) {
      this.hud.hidePrompt();
      this.hud.openInspect(this.current.title, this.current.body);
      this.current.onInteract?.();
    }
  }

  findInteractable(object) {
    for (let o = object; o; o = o.parent) {
      if (this.byObject.has(o)) return this.byObject.get(o);
    }
    return null;
  }
}
