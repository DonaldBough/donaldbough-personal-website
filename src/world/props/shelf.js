import * as THREE from 'three/webgpu';
import { materials, mesh } from '../materials.js';

// A metal storage rack loaded with boxes and binders.
export function createShelf() {
  const group = new THREE.Group();
  const width = 1.4;
  const depth = 0.45;
  const height = 2.0;

  const postGeometry = new THREE.BoxGeometry(0.04, height, 0.04);
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      const post = mesh(postGeometry, materials.darkMetal);
      post.position.set(sx * (width / 2 - 0.02), height / 2, sz * (depth / 2 - 0.02));
      group.add(post);
    }
  }

  const binderMaterials = [0x7a1f1f, 0x1f3f7a, 0x2f5a2a, 0x8a7a2a, 0x222222].map(
    (color) => new THREE.MeshStandardMaterial({ color, roughness: 0.6 }),
  );
  [0.1, 0.6, 1.1, 1.6].forEach((y, level) => {
    const shelf = mesh(new THREE.BoxGeometry(width, 0.03, depth), materials.paintedMetal);
    shelf.position.y = y;
    group.add(shelf);

    // Alternate between cardboard boxes and rows of binders.
    if (level % 2 === 0) {
      for (let i = 0; i < 3; i++) {
        const w = 0.3 + Math.random() * 0.1;
        const h = 0.22 + Math.random() * 0.12;
        const box = mesh(new THREE.BoxGeometry(w, h, 0.35), materials.cardboard);
        box.position.set(-0.45 + i * 0.45, y + 0.015 + h / 2, 0);
        box.rotation.y = (Math.random() - 0.5) * 0.2;
        group.add(box);
      }
    } else {
      for (let i = 0; i < 14; i++) {
        const binder = mesh(new THREE.BoxGeometry(0.06, 0.3, 0.28), binderMaterials[i % binderMaterials.length]);
        binder.position.set(-0.6 + i * 0.065, y + 0.165, 0.02);
        binder.rotation.z = i === 13 ? 0.25 : 0;
        group.add(binder);
      }
    }
  });

  return { object: group, interactables: [], solid: true };
}
