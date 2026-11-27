import * as THREE from 'three/webgpu';
import { glowTexture } from './textures.js';

// Neon tubes and soft glow halos. Halos are additive textured planes, a cheap stand-in for bloom.
export const NEON = { magenta: 0xff2bd6, cyan: 0x19e6ff };

const tubeMaterials = new Map();
const haloMaterials = new Map();
const haloTextures = {};
const ignoreRaycast = () => {};

// Unlit and not tone mapped so the color stays fully saturated.
export function neonMaterial(color) {
  if (!tubeMaterials.has(color)) tubeMaterials.set(color, new THREE.MeshBasicMaterial({ color, toneMapped: false }));
  return tubeMaterials.get(color);
}

// A glow plane facing +z. Halos don't block interaction raycasts.
export function halo(width, height, color, { shape = 'strip', opacity = 0.45 } = {}) {
  const key = `${color}-${shape}-${opacity}`;
  if (!haloMaterials.has(key)) {
    haloTextures[shape] ??= glowTexture(shape);
    haloMaterials.set(
      key,
      new THREE.MeshBasicMaterial({
        color,
        map: haloTextures[shape],
        transparent: true,
        opacity,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        toneMapped: false,
      }),
    );
  }
  const plane = new THREE.Mesh(new THREE.PlaneGeometry(width, height), haloMaterials.get(key));
  plane.raycast = ignoreRaycast;
  return plane;
}

// A glowing tube along local x, mounted on a surface facing +z, with a halo behind it.
export function neonStrip(length, color, { thickness = 0.025, haloHeight = 0.35 } = {}) {
  const group = new THREE.Group();
  const tube = new THREE.Mesh(new THREE.BoxGeometry(length, thickness, thickness), neonMaterial(color));
  tube.position.z = thickness / 2;
  const glow = halo(length + haloHeight, haloHeight, color);
  glow.position.z = 0.003;
  group.add(tube, glow);
  return group;
}
