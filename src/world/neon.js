import * as THREE from 'three/webgpu';
import { createNeonTubeMaterial } from './neonMaterial.js';
import { glowTexture } from './textures.js';

// Neon tubes and soft glow halos. Halos are additive textured planes, a cheap stand-in for bloom.
export const NEON = { magenta: 0xff2bd6, cyan: 0x19e6ff };
export const SHOW_FAKE_HALOS = false;

// The maps reuse materials per color/shape and textures by shape, avoiding duplicate pipelines and canvas uploads.
const tubeMaterials = new Map();
const haloMaterials = new Map();
const haloTextures = {};
const ignoreRaycast = () => {};
let nextStripIndex = 0;

// ACES squeezes bright HDR values into 0–1 and desaturates the brightest; toneMapped: false keeps neon magenta/cyan pure.
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
  plane.visible = SHOW_FAKE_HALOS;
  plane.raycast = ignoreRaycast;
  return plane;
}

// A glowing tube along local x, mounted on a surface facing +z, with a halo behind it.
export function neonStrip(length, color, { thickness = 0.05, haloHeight = 0.35, damaged = false, stuttering = false } = {}) {
  const group = new THREE.Group();
  const radius = thickness / 2;
  const geometry = new THREE.CylinderGeometry(radius, radius, length, 12).rotateZ(-Math.PI / 2);
  const tube = new THREE.Mesh(geometry, createNeonTubeMaterial(color, length, nextStripIndex++, { damaged, stuttering }));
  tube.position.z = thickness / 2;
  // Halo stays within the tube length so it never widens a solid prop's collision bounds.
  const glow = halo(length, haloHeight, color);
  glow.position.z = 0.003;
  group.add(tube, glow);
  return group;
}
