import * as THREE from 'three/webgpu';

const REACH = 2.5;
const SCREEN_CENTER = new THREE.Vector2(0, 0);

// Each frame, one ray goes from the camera through the crosshair; intersectObject(scene, true) returns every hit within REACH, nearest first.
// We take the nearest mesh and walk its parents until byObject finds a registered root (title/body), rather than testing each target.
// A wall or nearer object wins. interact() is called by E, the hand button, or a right-half tap.
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
