import * as THREE from 'three/webgpu';

const INTENSITY = 40;

// A shadow-casting spotlight held slightly to the right of the camera.
export function createFlashlight(camera) {
  const light = new THREE.SpotLight(0xfff1d6, 0, 18, 0.38, 0.45, 1.5);
  light.position.set(0.25, -0.2, 0.1);
  light.target.position.set(0, 0, -5);
  light.castShadow = true;
  light.shadow.mapSize.set(1024, 1024);
  light.shadow.camera.near = 0.1;
  light.shadow.bias = -0.0005;
  camera.add(light, light.target);

  let on = false;

  function toggle() {
    on = !on;
    light.intensity = on ? INTENSITY : 0;
  }

  // A little hand sway so the beam feels held rather than bolted to the camera.
  function update(dt, elapsed) {
    light.target.position.x = Math.sin(elapsed * 1.3) * 0.06;
    light.target.position.y = Math.sin(elapsed * 2.1) * 0.04;
  }

  return { toggle, update };
}
