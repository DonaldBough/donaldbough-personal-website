import * as THREE from 'three/webgpu';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';

const EYE_HEIGHT = 1.65;
const RADIUS = 0.3;
const WALK_SPEED = 2.2;
const SPRINT_SPEED = 4.0;
const TOUCH_LOOK_SPEED = 0.004; // radians per pixel dragged

// First-person movement: pointer-lock mouse look (desktop) or touch look (mobile),
// WASD or a touch joystick, sprint, simple collisions and head bob.
export class Player {
  constructor(camera, domElement, { bounds, colliders }) {
    this.camera = camera;
    this.controls = new PointerLockControls(camera, domElement);
    this.bounds = bounds;
    this.colliders = colliders;
    this.velocity = new THREE.Vector2(); // x = strafe, y = forward (meters/second)
    this.keys = new Set();
    this.bobPhase = 0;
    this.touchActive = false; // pointer lock isn't available on iOS, so touch mode tracks this itself
    this.touchMove = new THREE.Vector2();
    // Euler stores three angles; YXZ applies yaw before pitch, FPS-style, so the horizon never tilts.
    this.euler = new THREE.Euler(0, 0, 0, 'YXZ');

    window.addEventListener('keydown', (e) => this.keys.add(e.code));
    window.addEventListener('keyup', (e) => this.keys.delete(e.code));
    window.addEventListener('blur', () => this.keys.clear());
  }

  spawn({ position, lookAt }) {
    this.camera.position.set(position.x, EYE_HEIGHT, position.z);
    this.camera.lookAt(lookAt);
  }

  lock() {
    this.controls.lock();
  }

  get isActive() {
    return this.controls.isLocked || this.touchActive;
  }

  // Rotate the view by a drag of (dx, dy) pixels.
  look(dx, dy) {
    this.euler.setFromQuaternion(this.camera.quaternion);
    this.euler.y -= dx * TOUCH_LOOK_SPEED;
    this.euler.x -= dy * TOUCH_LOOK_SPEED;
    this.euler.x = THREE.MathUtils.clamp(this.euler.x, -Math.PI / 2 + 0.01, Math.PI / 2 - 0.01);
    this.camera.quaternion.setFromEuler(this.euler);
  }

  update(dt) {
    if (!this.isActive) return;

    const k = this.keys;
    const input = new THREE.Vector2(
      (k.has('KeyD') ? 1 : 0) - (k.has('KeyA') ? 1 : 0),
      (k.has('KeyW') ? 1 : 0) - (k.has('KeyS') ? 1 : 0),
    ).add(this.touchMove);
    if (input.lengthSq() > 1) input.normalize();
    const speed = k.has('ShiftLeft') || k.has('ShiftRight') ? SPRINT_SPEED : WALK_SPEED;

    // Ease toward the target velocity so starting and stopping feel smooth.
    this.velocity.x = THREE.MathUtils.damp(this.velocity.x, input.x * speed, 10, dt);
    this.velocity.y = THREE.MathUtils.damp(this.velocity.y, input.y * speed, 10, dt);
    this.controls.moveRight(this.velocity.x * dt);
    this.controls.moveForward(this.velocity.y * dt);
    this.resolveCollisions();

    const moving = this.velocity.length();
    this.bobPhase += dt * moving * 3.2;
    this.camera.position.y = EYE_HEIGHT + Math.sin(this.bobPhase * 2) * 0.025 * Math.min(moving / WALK_SPEED, 1);
  }

  // Treat the player as a circle on the floor and push it out of any overlapping box.
  resolveCollisions() {
    const p = this.camera.position;

    for (const box of this.colliders) {
      const closestX = THREE.MathUtils.clamp(p.x, box.min.x, box.max.x);
      const closestZ = THREE.MathUtils.clamp(p.z, box.min.z, box.max.z);
      const dx = p.x - closestX;
      const dz = p.z - closestZ;
      const distSq = dx * dx + dz * dz;
      if (distSq >= RADIUS * RADIUS) continue;

      if (distSq > 1e-8) {
        const dist = Math.sqrt(distSq);
        p.x = closestX + (dx / dist) * RADIUS;
        p.z = closestZ + (dz / dist) * RADIUS;
      } else {
        // Center is inside the box: push out through the nearest side.
        const exits = [
          [box.min.x - RADIUS - p.x, 0],
          [box.max.x + RADIUS - p.x, 0],
          [0, box.min.z - RADIUS - p.z],
          [0, box.max.z + RADIUS - p.z],
        ];
        exits.sort((a, b) => Math.abs(a[0] + a[1]) - Math.abs(b[0] + b[1]));
        p.x += exits[0][0];
        p.z += exits[0][1];
      }
    }

    const { minX, maxX, minZ, maxZ } = this.bounds;
    p.x = THREE.MathUtils.clamp(p.x, minX + RADIUS, maxX - RADIUS);
    p.z = THREE.MathUtils.clamp(p.z, minZ + RADIUS, maxZ - RADIUS);
  }
}
