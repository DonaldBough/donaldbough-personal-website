import * as THREE from 'three/webgpu';
import { materials, mesh } from '../materials.js';
import { content } from '../../content.js';

// A central lab island with glowing glassware.
export function createLabBench() {
  const group = new THREE.Group();

  const cabinet = mesh(new THREE.BoxGeometry(2.4, 0.88, 0.85), materials.paintedMetal);
  cabinet.position.y = 0.44;
  const top = mesh(new THREE.BoxGeometry(2.5, 0.04, 0.95), materials.epoxyTop);
  top.position.y = 0.9;
  group.add(cabinet, top);

  // Drawer handles on both long sides.
  for (const side of [-1, 1]) {
    for (let i = 0; i < 4; i++) {
      const handle = mesh(new THREE.BoxGeometry(0.18, 0.02, 0.02), materials.brushedSteel);
      handle.position.set(-0.9 + i * 0.6, 0.75, side * 0.435);
      group.add(handle);
    }
  }

  const glassware = [
    { make: beaker, x: -0.8, z: 0.1, liquid: 0x39ff88 },
    { make: flask, x: -0.45, z: -0.15, liquid: 0x2fa8ff },
    { make: beaker, x: -0.2, z: 0.18, liquid: 0xffa02a, scale: 0.7 },
    { make: flask, x: 0.6, z: 0.05, liquid: 0xff3aa8, scale: 1.2 },
  ];
  for (const { make, x, z, liquid, scale = 1 } of glassware) {
    const item = make(liquid);
    item.position.set(x, 0.92, z);
    item.scale.setScalar(scale);
    group.add(item);
  }
  group.add(createTestTubeRack(0.15, -0.2));

  const glow = new THREE.PointLight(0x55ffaa, 0.6, 2.5, 2);
  glow.position.set(-0.4, 1.2, 0);
  group.add(glow);

  return { object: group, interactables: [{ object: group, ...content.labBench }], solid: true };
}

function liquidMaterial(color) {
  return new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.8, roughness: 0.2, transparent: true, opacity: 0.85 });
}

function beaker(color) {
  const group = new THREE.Group();
  const glass = mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.16, 24, 1, true), materials.glass, { castShadow: false });
  glass.position.y = 0.08;
  const liquid = new THREE.Mesh(new THREE.CylinderGeometry(0.056, 0.056, 0.09, 24), liquidMaterial(color));
  liquid.position.y = 0.046;
  group.add(liquid, glass);
  return group;
}

function flask(color) {
  const group = new THREE.Group();
  const profile = [
    [0.001, 0], [0.08, 0], [0.085, 0.01], [0.03, 0.14], [0.02, 0.16], [0.02, 0.22],
  ].map(([x, y]) => new THREE.Vector2(x, y));
  const glass = mesh(new THREE.LatheGeometry(profile, 24), materials.glass, { castShadow: false });
  const liquid = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.078, 0.07, 24), liquidMaterial(color));
  liquid.position.y = 0.037;
  group.add(liquid, glass);
  return group;
}

function createTestTubeRack(x, z) {
  const group = new THREE.Group();
  group.position.set(x, 0.92, z);
  const rack = mesh(new THREE.BoxGeometry(0.32, 0.02, 0.08), materials.brushedSteel);
  rack.position.y = 0.08;
  group.add(rack);
  const colors = [0x39ff88, 0xffe14a, 0x2fa8ff, 0xff5a3a, 0xb06bff];
  colors.forEach((color, i) => {
    const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.09, 12), liquidMaterial(color));
    tube.position.set(-0.12 + i * 0.06, 0.06, 0);
    group.add(tube);
  });
  return group;
}
