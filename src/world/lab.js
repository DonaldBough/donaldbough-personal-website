import * as THREE from 'three/webgpu';
import { createRoom, ROOM } from './room.js';
import { createLighting } from './lighting.js';
import { createTerminalStation } from './props/terminals.js';
import { createGuitarCorner } from './props/guitar.js';
import { createPhotoWall } from './props/photos.js';
import { createLabBench } from './props/labBench.js';
import { createShelf } from './props/shelf.js';
import { createOscar } from './props/oscar.js';

// Assembles the laboratory: the room, its lighting, and where each prop sits.
// Every prop returns { object, interactables, update?, solid? }.
export function createLab(scene, renderer, { backend }) {
  const room = createRoom();
  scene.add(room.object);
  const lighting = createLighting(scene, renderer);

  const halfW = ROOM.width / 2;
  const halfD = ROOM.depth / 2;

  const props = [
    place(createTerminalStation({ backend }), [-halfW + 0.45, 0, -0.5], Math.PI / 2),
    place(createPhotoWall(), [0, 1.75, -halfD + 0.005], 0),
    place(createLabBench(), [0.3, 0, -1.4], 0),
    place(createGuitarCorner(), [halfW - 0.7, 0, 2.6], -Math.PI / 2 - 0.4),
    place(createShelf(), [halfW - 0.3, 0, -2.6], -Math.PI / 2),
    place(createOscar(), [-2.2, 0, 1.6], 0.6),
  ];
  props.forEach((prop) => scene.add(prop.object));
  scene.updateMatrixWorld(true);

  // Solid props block the player using their world-space bounding boxes.
  const colliders = props.filter((p) => p.solid).map((p) => new THREE.Box3().setFromObject(p.object));

  const interactables = [...room.interactables, ...props.flatMap((p) => p.interactables)];
  const updatable = props.filter((p) => p.update);

  function update(dt, elapsed, context) {
    lighting.update(dt, elapsed);
    updatable.forEach((p) => p.update(dt, elapsed, context));
  }

  return {
    colliders,
    interactables,
    update,
    bounds: { minX: -halfW, maxX: halfW, minZ: -halfD, maxZ: halfD },
    spawn: { position: new THREE.Vector3(0.5, 0, 3.8), lookAt: new THREE.Vector3(0.3, 1.4, -2) },
  };
}

function place(prop, [x, y, z], rotationY) {
  prop.object.position.set(x, y, z);
  prop.object.rotation.y = rotationY;
  return prop;
}
