import * as THREE from 'three/webgpu';
import { createRenderer, backendName, handleResize } from './core/renderer.js';
import { isTouchDevice } from './core/device.js';
import { createLab } from './world/lab.js';
import { Player } from './player/player.js';
import { createFlashlight } from './player/flashlight.js';
import { Interactions } from './interaction/interactions.js';
import { TouchControls } from './input/touchControls.js';
import { Hud } from './ui/hud.js';

const hud = new Hud({ touch: isTouchDevice });

try {
  await start();
} catch (error) {
  console.error(error);
  hud.setStatus(`Failed to start: ${error.message}`);
}

async function start() {
  hud.setStatus('Starting renderer…');
  const renderer = await createRenderer(document.getElementById('app'));
  const backend = backendName(renderer);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.05, 50);
  scene.add(camera); // The camera is in the scene so the flashlight attached to it renders.
  handleResize(renderer, camera);

  const lab = createLab(scene, renderer, { backend });
  const player = new Player(camera, renderer.domElement, lab);
  player.spawn(lab.spawn);
  const flashlight = createFlashlight(camera);
  const interactions = new Interactions(camera, lab.interactables, hud);

  // ---------- Input & UI wiring ----------

  // Desktop: pointer lock. Its lock/unlock events show and hide the overlay.
  player.controls.addEventListener('lock', () => hud.setOverlayVisible(false));
  player.controls.addEventListener('unlock', () => {
    hud.setOverlayVisible(true);
    hud.closeInspect();
  });

  window.addEventListener('keydown', (e) => {
    if (!player.isActive || e.repeat) return;
    if (e.code === 'KeyE') interactions.interact();
    if (e.code === 'KeyF') flashlight.toggle();
  });

  // Touch: pointer lock isn't supported on iOS, so touch mode is entered and paused manually.
  const touch = isTouchDevice
    ? new TouchControls({
        onLook: (dx, dy) => player.look(dx, dy),
        onInteract: () => interactions.interact(),
        onFlashlight: () => flashlight.toggle(),
        onPause: () => setTouchActive(false),
      })
    : null;

  function setTouchActive(active) {
    player.touchActive = active;
    hud.setOverlayVisible(!active);
    if (active) touch.show();
    else {
      touch.hide();
      hud.closeInspect();
    }
  }

  hud.onStart(() => (touch ? setTouchActive(true) : player.lock()));

  // ---------- Main loop ----------

  const timer = new THREE.Timer();
  timer.connect(document);

  function frame(timestamp) {
    timer.update(timestamp);
    const dt = Math.min(timer.getDelta(), 0.1);
    const elapsed = timer.getElapsed();

    if (touch) {
      player.touchMove.copy(touch.move);
      touch.setInteractAvailable(Boolean(interactions.current) || hud.isInspecting);
    }
    player.update(dt);
    lab.update(dt, elapsed, { playerPosition: camera.position });
    flashlight.update(dt, elapsed);
    interactions.update();
    hud.updateStats(dt, backend);

    renderer.render(scene, camera);
  }

  // Compile shaders up front to avoid a hitch on the first frames.
  hud.setStatus('Compiling shaders…');
  await renderer.compileAsync(scene, camera);
  renderer.setAnimationLoop(frame);
  hud.setStatus(`Renderer: ${backend}`);
  hud.setReady();

  // Handy for poking around from the browser devtools console.
  window.lab = { THREE, scene, camera, renderer, player, interactions };
}
