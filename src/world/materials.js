import * as THREE from 'three/webgpu';

// Shared materials reused across props. Reusing materials keeps GPU pipelines to a minimum.
export const materials = {
  paintedMetal: new THREE.MeshStandardMaterial({ color: 0x4f5a56, roughness: 0.55, metalness: 0.6 }),
  darkMetal: new THREE.MeshStandardMaterial({ color: 0x23272a, roughness: 0.4, metalness: 0.8 }),
  brushedSteel: new THREE.MeshStandardMaterial({ color: 0x9aa0a3, roughness: 0.35, metalness: 0.9 }),
  beigePlastic: new THREE.MeshStandardMaterial({ color: 0xcfc6ad, roughness: 0.6 }),
  blackPlastic: new THREE.MeshStandardMaterial({ color: 0x151515, roughness: 0.5 }),
  epoxyTop: new THREE.MeshStandardMaterial({ color: 0x1b1e1d, roughness: 0.3 }),
  wood: new THREE.MeshStandardMaterial({ color: 0x6b4426, roughness: 0.55 }),
  cardboard: new THREE.MeshStandardMaterial({ color: 0x9c7a4f, roughness: 0.9 }),
  fabric: new THREE.MeshStandardMaterial({ color: 0x3a4a6b, roughness: 0.95 }),
  glass: new THREE.MeshStandardMaterial({ color: 0xcfe8ff, roughness: 0.05, metalness: 0.1, transparent: true, opacity: 0.25 }),
};

// Small helper: create a mesh that casts and receives shadows.
export function mesh(geometry, material, { castShadow = true, receiveShadow = true } = {}) {
  const m = new THREE.Mesh(geometry, material);
  m.castShadow = castShadow;
  m.receiveShadow = receiveShadow;
  return m;
}
