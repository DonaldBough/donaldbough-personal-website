import * as THREE from 'three/webgpu';
import { mesh } from '../materials.js';
import { content } from '../../content.js';
import { NEON, neonMaterial } from '../neon.js';

// Oscar the miniature dachshund, built from primitives, standing on his bed.
// He breathes, wags his tail, and turns his head to watch you. Interacting makes him happy.
// Faces local +z.
export function createOscar() {
  const group = new THREE.Group();
  group.add(createBed());

  const dog = new THREE.Group();
  dog.position.y = 0.05;
  group.add(dog);

  const coat = new THREE.MeshStandardMaterial({ color: 0xb0743c, roughness: 0.8 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x0c0806, roughness: 0.3 });

  // Long sausage body.
  const body = mesh(new THREE.CapsuleGeometry(0.085, 0.3, 8, 16), coat);
  body.rotation.x = Math.PI / 2;
  body.position.y = 0.17;
  const chest = mesh(new THREE.SphereGeometry(0.092, 16, 12), coat);
  chest.position.set(0, 0.16, 0.13);
  dog.add(body, chest);

  // Short legs.
  const legGeometry = new THREE.CapsuleGeometry(0.026, 0.07, 4, 8);
  for (const x of [-0.05, 0.05]) {
    for (const z of [-0.15, 0.14]) {
      const leg = mesh(legGeometry, coat);
      leg.position.set(x, 0.06, z);
      dog.add(leg);
    }
  }

  // Head, snout, nose, eyes and floppy ears.
  const head = new THREE.Group();
  head.position.set(0, 0.25, 0.22);
  dog.add(head);

  const skull = mesh(new THREE.SphereGeometry(0.065, 16, 12), coat);
  skull.scale.set(1, 0.95, 1.15);
  const snout = mesh(new THREE.CapsuleGeometry(0.032, 0.07, 4, 12), coat);
  snout.rotation.x = Math.PI / 2;
  snout.position.set(0, -0.018, 0.08);
  const nose = mesh(new THREE.SphereGeometry(0.016, 10, 8), dark);
  nose.position.set(0, -0.012, 0.15);
  head.add(skull, snout, nose);

  for (const side of [-1, 1]) {
    const eye = mesh(new THREE.SphereGeometry(0.012, 10, 8), dark);
    eye.position.set(side * 0.03, 0.02, 0.06);
    const ear = mesh(new THREE.SphereGeometry(0.05, 12, 10), coat);
    ear.scale.set(0.25, 1, 0.7);
    ear.position.set(side * 0.062, -0.03, -0.01);
    ear.rotation.z = side * 0.15;
    head.add(eye, ear);
  }

  // Glowing collar around the neck, tilted to match it.
  const collar = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.01, 8, 24), neonMaterial(NEON.cyan));
  collar.position.set(0, 0.205, 0.175);
  collar.rotation.x = -Math.PI / 4;
  dog.add(collar);

  // Tail pivots at its base so it can wag.
  const tail = new THREE.Group();
  tail.position.set(0, 0.2, -0.24);
  const tailMesh = mesh(new THREE.ConeGeometry(0.018, 0.16, 8), coat);
  tailMesh.position.y = 0.08;
  tail.rotation.x = -0.9;
  tail.add(tailMesh);
  dog.add(tail);

  // ---------- Behavior ----------

  let happyTime = 0;
  const playerLocal = new THREE.Vector3();

  function update(dt, elapsed, { playerPosition }) {
    happyTime = Math.max(0, happyTime - dt);
    const happy = happyTime > 0;

    body.scale.x = 1 + Math.sin(elapsed * 3) * 0.03; // breathing
    tail.rotation.z = Math.sin(elapsed * (happy ? 28 : 8)) * (happy ? 0.7 : 0.35);
    dog.position.y = 0.05 + (happy ? Math.abs(Math.sin(elapsed * 9)) * 0.06 : 0);

    // Turn the head toward the player when nearby.
    playerLocal.copy(playerPosition);
    group.worldToLocal(playerLocal);
    const near = playerLocal.length() < 4;
    const targetYaw = near ? THREE.MathUtils.clamp(Math.atan2(playerLocal.x, playerLocal.z), -0.9, 0.9) : 0;
    head.rotation.y = THREE.MathUtils.damp(head.rotation.y, targetYaw, 4, dt);
    head.rotation.x = THREE.MathUtils.damp(head.rotation.x, near ? -0.25 : 0.1, 3, dt);
  }

  const interactables = [{ object: dog, ...content.oscar, onInteract: () => (happyTime = 3) }];
  return { object: group, interactables, update, solid: true };
}

function createBed() {
  const bed = new THREE.Group();
  const fabric = new THREE.MeshStandardMaterial({ color: 0x5b6e8c, roughness: 1 });
  const rim = mesh(new THREE.TorusGeometry(0.34, 0.08, 12, 32), fabric);
  rim.rotation.x = Math.PI / 2;
  rim.position.y = 0.07;
  rim.scale.set(1, 1.3, 1);
  const cushion = mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.05, 32), fabric);
  cushion.scale.set(1, 1, 1.3);
  cushion.position.y = 0.025;
  bed.add(rim, cushion);
  return bed;
}
