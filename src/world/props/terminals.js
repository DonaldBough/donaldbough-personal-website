import * as THREE from 'three/webgpu';
import { materials, mesh } from '../materials.js';
import { createScreenTexture } from '../textures.js';
import { createDesk } from './desk.js';
import { content } from '../../content.js';

// A long desk with three CRT terminals. Local +z is "toward the user" (in front of the screens).
export function createTerminalStation({ backend }) {
  const group = new THREE.Group();
  const desk = createDesk({ width: 3.2, depth: 0.8 });
  group.add(desk);

  const entries = [content.terminal, content.terminalGpu, content.terminalAi];
  const screens = [];
  const interactables = [];

  entries.forEach((entry, i) => {
    const lines = entry.screen.map((line) => line.replace('{backend}', backend));
    const terminal = createTerminal(lines);
    terminal.object.position.set((i - 1) * 1.05, 0.76, -0.1);
    terminal.object.rotation.y = (1 - i) * 0.12;
    group.add(terminal.object);
    screens.push(terminal);
    interactables.push({ object: terminal.object, title: entry.title, body: entry.body });
  });

  // A soft green spill from the screens onto the desk and wall.
  const glow = new THREE.PointLight(0x5cff8a, 1.2, 3.5, 2);
  glow.position.set(0, 1.15, 0.35);
  group.add(glow);

  let blinkTimer = 0;
  let cursorVisible = true;
  function update(dt, elapsed) {
    blinkTimer += dt;
    if (blinkTimer > 0.5) {
      blinkTimer = 0;
      cursorVisible = !cursorVisible;
      screens.forEach((s) => s.redraw(cursorVisible));
    }
    glow.intensity = 1.1 + Math.sin(elapsed * 60) * 0.05;
  }

  return { object: group, interactables, update, solid: true };
}

function createTerminal(lines) {
  const group = new THREE.Group();

  const body = mesh(new THREE.BoxGeometry(0.46, 0.38, 0.42), materials.beigePlastic);
  body.position.set(0, 0.24, -0.05);
  const back = mesh(new THREE.BoxGeometry(0.34, 0.28, 0.2), materials.beigePlastic);
  back.position.set(0, 0.24, -0.33);
  const stand = mesh(new THREE.BoxGeometry(0.3, 0.05, 0.3), materials.beigePlastic);
  stand.position.set(0, 0.025, -0.05);

  const bezel = mesh(new THREE.BoxGeometry(0.4, 0.31, 0.01), materials.blackPlastic);
  bezel.position.set(0, 0.25, 0.166);

  const { texture, draw } = createScreenTexture();
  draw(lines, true);
  const screen = new THREE.Mesh(
    new THREE.PlaneGeometry(0.36, 0.27),
    new THREE.MeshStandardMaterial({ color: 0x000000, emissive: 0xffffff, emissiveMap: texture, emissiveIntensity: 1.4, roughness: 0.15 }),
  );
  screen.position.set(0, 0.25, 0.172);

  const keyboard = mesh(new THREE.BoxGeometry(0.42, 0.025, 0.15), materials.beigePlastic);
  keyboard.position.set(0, 0.0125, 0.3);
  keyboard.rotation.x = 0.05;

  group.add(body, back, stand, bezel, screen, keyboard);
  return { object: group, redraw: (cursorVisible) => draw(lines, cursorVisible) };
}
