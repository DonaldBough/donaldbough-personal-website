import * as THREE from 'three/webgpu';
import { materials, mesh } from './materials.js';
import { floorTexture, floorGlowTexture, wallTexture, wainscotTexture, ceilingTexture, neonSignTexture } from './textures.js';
import { NEON, neonStrip, halo } from './neon.js';
import { content } from '../content.js';

// Room dimensions in meters. The origin is the center of the floor.
export const ROOM = { width: 12, depth: 10, height: 3.2, wainscotHeight: 1.2 };

export function createRoom() {
  const group = new THREE.Group();
  const { width, depth, height } = ROOM;

  const floor = mesh(
    new THREE.PlaneGeometry(width, depth),
    new THREE.MeshStandardMaterial({
      map: floorTexture([width / 2, depth / 2]),
      emissive: 0xffffff,
      emissiveMap: floorGlowTexture([width / 2, depth / 2]),
      emissiveIntensity: 0.25,
      roughness: 0.15,
      metalness: 0.5,
    }),
    { castShadow: false },
  );
  floor.rotation.x = -Math.PI / 2;
  group.add(floor);

  const ceiling = mesh(
    new THREE.PlaneGeometry(width, depth),
    new THREE.MeshStandardMaterial({ map: ceilingTexture([width / 1.2, depth / 1.2]), roughness: 0.7 }),
    { castShadow: false },
  );
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.y = height;
  group.add(ceiling);

  // Four walls: [length, position, rotation]. Each faces the room's interior.
  const walls = [
    [width, new THREE.Vector3(0, 0, -depth / 2), 0], // north
    [width, new THREE.Vector3(0, 0, depth / 2), Math.PI], // south
    [depth, new THREE.Vector3(-width / 2, 0, 0), Math.PI / 2], // west
    [depth, new THREE.Vector3(width / 2, 0, 0), -Math.PI / 2], // east
  ];
  for (const [length, position, rotation] of walls) {
    group.add(createWall(length, position, rotation));
  }

  group.add(createPipes());

  const door = createDoor();
  door.position.set(3, 0, depth / 2);
  door.rotation.y = Math.PI;
  group.add(door);

  const sign = createNeonSign('DONALDBOUGH.COM', NEON.magenta);
  sign.object.position.set(3, 2.8, depth / 2 - 0.02);
  sign.object.rotation.y = Math.PI;
  group.add(sign.object);

  return {
    object: group,
    interactables: [{ object: door, ...content.door }],
    update: sign.update,
  };
}

function createWall(length, position, rotation) {
  const { height, wainscotHeight } = ROOM;
  const wall = new THREE.Group();
  wall.position.copy(position);
  wall.rotation.y = rotation;

  const upperHeight = height - wainscotHeight;
  const upper = mesh(
    new THREE.PlaneGeometry(length, upperHeight),
    new THREE.MeshStandardMaterial({ map: wallTexture([length / 2, upperHeight / 2]), roughness: 0.5, metalness: 0.5 }),
    { castShadow: false },
  );
  upper.position.y = wainscotHeight + upperHeight / 2;

  const lower = mesh(
    new THREE.PlaneGeometry(length, wainscotHeight),
    new THREE.MeshStandardMaterial({ map: wainscotTexture([length / 1.2, 1]), roughness: 0.4, metalness: 0.6 }),
    { castShadow: false },
  );
  lower.position.y = wainscotHeight / 2;

  // Trim strip between the panels, a baseboard, and neon along the floor and ceiling edges.
  const trim = mesh(new THREE.BoxGeometry(length, 0.05, 0.03), materials.darkMetal);
  trim.position.set(0, wainscotHeight, 0.015);
  const baseboard = mesh(new THREE.BoxGeometry(length, 0.12, 0.03), materials.blackPlastic);
  baseboard.position.set(0, 0.06, 0.015);

  const floorNeon = neonStrip(length, NEON.cyan);
  floorNeon.position.y = 0.135;
  const ceilingNeon = neonStrip(length, NEON.magenta);
  ceilingNeon.position.y = height - 0.04;

  wall.add(upper, lower, trim, baseboard, floorNeon, ceilingNeon);
  return wall;
}

function createPipes() {
  const group = new THREE.Group();
  const { width, depth, height } = ROOM;
  const pipeGeometry = new THREE.CylinderGeometry(0.06, 0.06, width, 16);
  for (const [offset, radiusScale] of [[0.15, 1], [0.35, 0.6]]) {
    const pipe = mesh(pipeGeometry, materials.paintedMetal);
    pipe.scale.set(radiusScale, 1, radiusScale);
    pipe.rotation.z = Math.PI / 2;
    pipe.position.set(0, height - 0.18, -depth / 2 + offset);
    group.add(pipe);

    // Brackets holding the pipe to the ceiling.
    for (let x = -width / 2 + 1; x < width / 2; x += 2) {
      const bracket = mesh(new THREE.BoxGeometry(0.04, 0.18, 0.04), materials.darkMetal);
      bracket.position.set(x, height - 0.09, -depth / 2 + offset);
      group.add(bracket);
    }
  }
  return group;
}

function createDoor() {
  const group = new THREE.Group();
  const frame = mesh(new THREE.BoxGeometry(1.4, 2.4, 0.12), materials.darkMetal);
  frame.position.set(0, 1.2, 0);
  const slab = mesh(new THREE.BoxGeometry(1.2, 2.25, 0.08), materials.paintedMetal);
  slab.position.set(0, 1.125, 0.05);
  const doorWindow = mesh(
    new THREE.PlaneGeometry(0.35, 0.5),
    new THREE.MeshStandardMaterial({ color: 0x05080c, emissive: NEON.cyan, emissiveIntensity: 0.15, roughness: 0.1, metalness: 0.5 }),
  );
  doorWindow.position.set(0, 1.6, 0.095);
  const handle = mesh(new THREE.BoxGeometry(0.2, 0.04, 0.06), materials.brushedSteel);
  handle.position.set(0.42, 1.05, 0.12);

  // Neon outline around the frame.
  const top = neonStrip(1.42, NEON.cyan, { haloHeight: 0.25 });
  top.position.set(0, 2.41, 0.06);
  group.add(top);
  for (const side of [-1, 1]) {
    const edge = neonStrip(2.4, NEON.cyan, { haloHeight: 0.25 });
    edge.rotation.z = Math.PI / 2;
    edge.position.set(side * 0.71, 1.2, 0.06);
    group.add(edge);
  }

  group.add(frame, slab, doorWindow, handle);
  return group;
}

// Glowing lettering with a halo that flickers now and then.
function createNeonSign(text, color) {
  const group = new THREE.Group();
  const material = new THREE.MeshBasicMaterial({ map: neonSignTexture(text, color), transparent: true, toneMapped: false });
  const letters = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 0.31), material);
  letters.position.z = 0.01;
  const glow = halo(2.6, 0.7, color, { shape: 'spot', opacity: 0.35 });
  group.add(glow, letters);

  let timer = 0;
  function update(dt) {
    timer -= dt;
    if (timer <= 0) {
      const dim = Math.random() < 0.3;
      material.opacity = dim ? 0.25 : 1;
      glow.visible = !dim;
      timer = dim ? Math.random() * 0.08 : 2 + Math.random() * 5;
    }
  }
  return { object: group, update };
}
