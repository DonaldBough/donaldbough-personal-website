import * as THREE from 'three/webgpu';
import { createRenderer, backendName, handleResize } from './core/renderer.js';
import { createLab } from './world/lab.js';
import { Player } from './player/player.js';
import { createFlashlight } from './player/flashlight.js';
import { Interactions } from './interaction/interactions.js';
import { Hud } from './ui/hud.js';

const hud = new Hud();
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

hud.onStart(() => player.lock());
player.controls.addEventListener('lock', () => hud.setOverlayVisible(false));
player.controls.addEventListener('unlock', () => {
  hud.setOverlayVisible(true);
  hud.closeInspect();
});

window.addEventListener('keydown', (e) => {
  if (!player.isLocked || e.repeat) return;
  if (e.code === 'KeyE') interactions.interact();
  if (e.code === 'KeyF') flashlight.toggle();
});

// ---------- Main loop ----------

const timer = new THREE.Timer();
timer.connect(document);

function frame(timestamp) {
  timer.update(timestamp);
  const dt = Math.min(timer.getDelta(), 0.1);
  const elapsed = timer.getElapsed();

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
window.lab = { THREE, scene, camera, renderer, player };
