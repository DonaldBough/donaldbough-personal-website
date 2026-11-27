import * as THREE from 'three/webgpu';

// A material describes how a surface reacts to light (color, roughness, metalness, emissive); textures can drive those values per pixel.
// One material can use several textures, such as map and emissiveMap on the floor.
export const materials = {
  paintedMetal: new THREE.MeshStandardMaterial({ color: 0x3a3f4a, roughness: 0.55, metalness: 0.6 }),
  darkMetal: new THREE.MeshStandardMaterial({ color: 0x23272a, roughness: 0.4, metalness: 0.8 }),
  brushedSteel: new THREE.MeshStandardMaterial({ color: 0x9aa0a3, roughness: 0.35, metalness: 0.9 }),
  gunmetal: new THREE.MeshStandardMaterial({ color: 0x262a33, roughness: 0.35, metalness: 0.8 }),
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
