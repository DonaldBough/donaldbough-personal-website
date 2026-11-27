import * as THREE from 'three/webgpu';
import { materials, mesh } from '../materials.js';
import { content } from '../../content.js';

// An acoustic guitar on a stand next to a small amp. Interacting strums a chord.
export function createGuitarCorner() {
  const group = new THREE.Group();

  const guitar = createGuitar();
  guitar.position.set(0, 0.32, 0);
  guitar.rotation.x = -0.22;
  group.add(guitar, createStand());

  const amp = createAmp();
  amp.position.set(0.65, 0, -0.1);
  amp.rotation.y = -0.3;
  group.add(amp);

  const interactables = [{ object: guitar, ...content.guitar, onInteract: strum }];
  return { object: group, interactables, solid: true };
}

function createGuitar() {
  const group = new THREE.Group();

  // Half of the body outline (x >= 0), mirrored to make the full figure-eight shape.
  const half = [
    [0.12, -0.235], [0.18, -0.17], [0.19, -0.1], [0.17, -0.01], [0.125, 0.06],
    [0.13, 0.11], [0.145, 0.17], [0.12, 0.225], [0.06, 0.25],
  ];
  const outline = [
    new THREE.Vector2(0, -0.25),
    ...half.map(([x, y]) => new THREE.Vector2(x, y)),
    new THREE.Vector2(0, 0.255),
    ...half.reverse().map(([x, y]) => new THREE.Vector2(-x, y)),
  ];
  const shape = new THREE.Shape();
  shape.moveTo(0, -0.25);
  shape.splineThru(outline.slice(1).concat([new THREE.Vector2(0, -0.25)]));

  const bodyGeometry = new THREE.ExtrudeGeometry(shape, {
    depth: 0.09, bevelEnabled: true, bevelThickness: 0.008, bevelSize: 0.008, bevelSegments: 3, curveSegments: 48,
  });
  bodyGeometry.translate(0, 0, -0.045);
  const spruce = new THREE.MeshStandardMaterial({ color: 0xc8813a, roughness: 0.3, metalness: 0.05 });
  const body = mesh(bodyGeometry, spruce);
  body.position.y = 0.25;
  group.add(body);

  const soundHole = new THREE.Mesh(new THREE.CircleGeometry(0.045, 32), materials.blackPlastic);
  soundHole.position.set(0, 0.33, 0.054);
  group.add(soundHole);

  const bridge = mesh(new THREE.BoxGeometry(0.1, 0.018, 0.01), materials.blackPlastic);
  bridge.position.set(0, 0.17, 0.056);
  group.add(bridge);

  const neck = mesh(new THREE.BoxGeometry(0.048, 0.46, 0.025), materials.wood);
  neck.position.set(0, 0.72, 0.035);
  const headstock = mesh(new THREE.BoxGeometry(0.075, 0.17, 0.02), materials.blackPlastic);
  headstock.position.set(0, 1.03, 0.03);
  headstock.rotation.x = -0.2;
  group.add(neck, headstock);

  // Six strings as simple line segments from the bridge to the nut.
  const points = [];
  for (let i = 0; i < 6; i++) {
    const x = (i - 2.5) * 0.007;
    points.push(new THREE.Vector3(x * 1.6, 0.17, 0.062), new THREE.Vector3(x, 0.945, 0.049));
  }
  const strings = new THREE.LineSegments(
    new THREE.BufferGeometry().setFromPoints(points),
    new THREE.LineBasicMaterial({ color: 0x8c8c86 }),
  );
  group.add(strings);

  return group;
}

function createStand() {
  const group = new THREE.Group();
  const legGeometry = new THREE.CylinderGeometry(0.01, 0.01, 0.55, 8);
  for (const [x, rz] of [[-0.12, 0.35], [0.12, -0.35]]) {
    const leg = mesh(legGeometry, materials.darkMetal);
    leg.position.set(x, 0.26, 0.04);
    leg.rotation.z = rz;
    group.add(leg);
  }
  const back = mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.75, 8), materials.darkMetal);
  back.position.set(0, 0.36, -0.12);
  back.rotation.x = -0.25;
  const cradle = mesh(new THREE.BoxGeometry(0.34, 0.03, 0.08), materials.blackPlastic);
  cradle.position.set(0, 0.31, 0.04);
  group.add(back, cradle);
  return group;
}

function createAmp() {
  const group = new THREE.Group();
  const cabinet = mesh(new THREE.BoxGeometry(0.5, 0.45, 0.25), new THREE.MeshStandardMaterial({ color: 0x141414, roughness: 0.9 }));
  cabinet.position.y = 0.225;
  const grille = mesh(new THREE.PlaneGeometry(0.42, 0.28), new THREE.MeshStandardMaterial({ color: 0x2b2620, roughness: 1 }));
  grille.position.set(0, 0.19, 0.126);
  const panel = mesh(new THREE.PlaneGeometry(0.46, 0.07), materials.brushedSteel);
  panel.position.set(0, 0.39, 0.126);
  group.add(cabinet, grille, panel);

  for (let i = 0; i < 5; i++) {
    const knob = mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.015, 12), materials.blackPlastic);
    knob.rotation.x = Math.PI / 2;
    knob.position.set(-0.16 + i * 0.07, 0.39, 0.134);
    group.add(knob);
  }
  return group;
}

// ---------- Sound: Karplus-Strong plucked-string synthesis ----------

let audioContext = null;

function pluck(ctx, frequency, duration = 3) {
  const sampleRate = ctx.sampleRate;
  const buffer = ctx.createBuffer(1, Math.floor(sampleRate * duration), sampleRate);
  const data = buffer.getChannelData(0);
  const ring = new Float32Array(Math.round(sampleRate / frequency)).map(() => Math.random() * 2 - 1);

  for (let i = 0; i < data.length; i++) {
    const j = i % ring.length;
    data[i] = ring[j];
    ring[j] = 0.996 * 0.5 * (ring[j] + ring[(j + 1) % ring.length]);
  }
  return buffer;
}

function strum() {
  audioContext ??= new AudioContext();
  const ctx = audioContext;
  const chord = [82.41, 123.47, 164.81, 207.65, 246.94, 329.63]; // E major
  const gain = ctx.createGain();
  gain.gain.value = 0.25;
  gain.connect(ctx.destination);

  chord.forEach((frequency, i) => {
    const source = ctx.createBufferSource();
    source.buffer = pluck(ctx, frequency);
    source.connect(gain);
    source.start(ctx.currentTime + i * 0.03);
  });
}
