import * as THREE from 'three/webgpu';
import { materials, mesh } from '../materials.js';

// A steel-framed desk. The desk's origin is on the floor at its center.
export function createDesk({ width = 1.6, depth = 0.75, height = 0.76, topMaterial = materials.epoxyTop } = {}) {
  const group = new THREE.Group();

  const top = mesh(new THREE.BoxGeometry(width, 0.04, depth), topMaterial);
  top.position.y = height - 0.02;
  group.add(top);

  const legGeometry = new THREE.BoxGeometry(0.05, height - 0.04, 0.05);
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      const leg = mesh(legGeometry, materials.darkMetal);
      leg.position.set(sx * (width / 2 - 0.05), (height - 0.04) / 2, sz * (depth / 2 - 0.05));
      group.add(leg);
    }
  }
  return group;
}
