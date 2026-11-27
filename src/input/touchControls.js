import * as THREE from 'three/webgpu';

const JOYSTICK_RADIUS = 50; // pixels

// On-screen controls for phones and tablets:
// - drag on the left half of the screen to move (a joystick appears under your thumb)
// - drag on the right half to look around
// - buttons for interact, flashlight and pause
export class TouchControls {
  constructor({ onLook, onInteract, onFlashlight, onPause }) {
    this.move = new THREE.Vector2(); // x = strafe, y = forward, each in [-1, 1]
    this.onLook = onLook;

    this.root = document.getElementById('touch-ui');
    this.stick = document.getElementById('joystick');
    this.knob = document.getElementById('joystick-knob');

    this.moveTouch = null; // { id, x, y } where the joystick was placed
    this.lookTouch = null; // { id, x, y } last look position

    this.root.addEventListener('pointerdown', (e) => this.onPointerDown(e));
    this.root.addEventListener('pointermove', (e) => this.onPointerMove(e));
    this.root.addEventListener('pointerup', (e) => this.onPointerUp(e));
    this.root.addEventListener('pointercancel', (e) => this.onPointerUp(e));

    bindButton('btn-interact', onInteract);
    bindButton('btn-flashlight', onFlashlight);
    bindButton('btn-pause', onPause);
  }

  show() {
    this.root.classList.remove('hidden');
  }

  hide() {
    this.root.classList.add('hidden');
    this.onPointerUp({ pointerId: this.moveTouch?.id });
    this.lookTouch = null;
  }

  setInteractAvailable(available) {
    document.getElementById('btn-interact').classList.toggle('available', available);
  }

  onPointerDown(e) {
    if (e.target.closest('button')) return;
    this.root.setPointerCapture(e.pointerId);

    if (e.clientX < window.innerWidth / 2 && !this.moveTouch) {
      this.moveTouch = { id: e.pointerId, x: e.clientX, y: e.clientY };
      this.stick.style.left = `${e.clientX}px`;
      this.stick.style.top = `${e.clientY}px`;
      this.stick.classList.remove('hidden');
      this.knob.style.transform = 'translate(-50%, -50%)';
    } else if (!this.lookTouch) {
      this.lookTouch = { id: e.pointerId, x: e.clientX, y: e.clientY };
    }
  }

  onPointerMove(e) {
    if (this.moveTouch?.id === e.pointerId) {
      const offset = new THREE.Vector2(e.clientX - this.moveTouch.x, e.clientY - this.moveTouch.y);
      offset.clampLength(0, JOYSTICK_RADIUS);
      this.knob.style.transform = `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px))`;
      this.move.set(offset.x / JOYSTICK_RADIUS, -offset.y / JOYSTICK_RADIUS);
    } else if (this.lookTouch?.id === e.pointerId) {
      this.onLook(e.clientX - this.lookTouch.x, e.clientY - this.lookTouch.y);
      this.lookTouch.x = e.clientX;
      this.lookTouch.y = e.clientY;
    }
  }

  onPointerUp(e) {
    if (this.moveTouch?.id === e.pointerId) {
      this.moveTouch = null;
      this.move.set(0, 0);
      this.stick.classList.add('hidden');
    } else if (this.lookTouch?.id === e.pointerId) {
      this.lookTouch = null;
    }
  }
}

// Buttons fire on click (touch release) because iOS only unlocks audio from a completed tap.
// Stopping pointerdown keeps the press from also starting a move or look drag.
function bindButton(id, callback) {
  const button = document.getElementById(id);
  button.addEventListener('pointerdown', (e) => e.stopPropagation());
  button.addEventListener('click', callback);
}
