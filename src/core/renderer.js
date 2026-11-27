import * as THREE from 'three/webgpu';
import { quality } from './device.js';

// WebGPURenderer automatically falls back to a WebGL2 backend when WebGPU is unavailable.
export async function createRenderer(container) {
  const renderer = new THREE.WebGPURenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, quality.maxPixelRatio));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true;
  // PCF averages several shadow-map samples at edges, making shadows soft instead of jagged.
  renderer.shadowMap.type = THREE.PCFShadowMap;

  container.appendChild(renderer.domElement);
  await renderer.init();

  return renderer;
}

export function backendName(renderer) {
  return renderer.backend.isWebGPUBackend ? 'WebGPU' : 'WebGL2 (fallback)';
}

export function handleResize(renderer, camera) {
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}
