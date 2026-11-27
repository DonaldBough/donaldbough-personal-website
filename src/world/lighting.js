import * as THREE from 'three/webgpu';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { ROOM } from './room.js';
import { materials, mesh } from './materials.js';
import { NEON } from './neon.js';
import { quality } from '../core/device.js';

export function createLighting(scene, renderer) {
  // PMREM prefilters RoomEnvironment into blurred levels for roughness: glossy surfaces reflect sharply, rough ones blur.
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.08;

  scene.background = new THREE.Color(0x05030a);
  scene.fog = new THREE.FogExp2(0x0b0716, 0.04);

  scene.add(new THREE.HemisphereLight(0x5a6cff, 0x200a24, 0.3));

  // Ceiling panels alternate magenta and cyan.
  const fixtures = [
    [-3, -2.5, NEON.magenta],
    [3, -2.5, NEON.cyan],
    [-3, 2.5, NEON.cyan],
    [3, 2.5, NEON.magenta],
  ].map(([x, z, color]) => createFixture(scene, x, z, color));

  // One panel still flickers occasionally, a nod to the old horror lab.
  const flickering = fixtures[3];
  let flickerTimer = 0;

  const doorPulse = createPulseLight(scene, 3, ROOM.depth / 2 - 0.15);

  function update(dt, elapsed) {
    flickerTimer -= dt;
    if (flickerTimer <= 0) {
      const off = Math.random() < 0.35;
      flickering.setOn(off ? Math.random() * 0.15 : 1);
      flickerTimer = off ? Math.random() * 0.12 : 1 + Math.random() * 6;
    }
    doorPulse.update(elapsed);
  }

  return { update };
}

function createFixture(scene, x, z, color) {
  const { height } = ROOM;
  const intensity = 22;

  const housing = mesh(
    new THREE.BoxGeometry(1.3, 0.08, 0.35),
    materials.gunmetal,
    { castShadow: false },
  );
  housing.position.set(x, height - 0.04, z);

  const panelMaterial = new THREE.MeshStandardMaterial({ color: 0x000000, emissive: color, emissiveIntensity: 2.5 });
  const panel = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.28), panelMaterial);
  panel.rotation.x = Math.PI / 2;
  panel.position.set(x, height - 0.081, z);

  const light = new THREE.SpotLight(color, intensity, 12, 1.25, 0.8, 1.6);
  light.position.set(x, height - 0.12, z);
  light.target.position.set(x, 0, z);
  light.castShadow = true;
  light.shadow.mapSize.setScalar(quality.shadowMapSize);
  light.shadow.bias = -0.0005;
  light.shadow.radius = 4;

  scene.add(housing, panel, light, light.target);

  return {
    setOn(level) {
      light.intensity = intensity * level;
      panelMaterial.emissiveIntensity = 2.5 * level;
    },
  };
}

// A slow magenta pulse above the door.
function createPulseLight(scene, x, z) {
  const material = new THREE.MeshStandardMaterial({ color: 0x100010, emissive: NEON.magenta, emissiveIntensity: 2 });
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.07, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), material);
  bulb.rotation.x = Math.PI / 2;
  bulb.position.set(x, 2.95, z);

  const light = new THREE.PointLight(NEON.magenta, 1, 5, 2);
  light.position.set(x, 2.9, z - 0.1);
  scene.add(bulb, light);

  return {
    update(elapsed) {
      // pulse rises 0→1→0 on a sine wave about every 5.2 seconds.
      // PointLight intensity is candela with no 1.0 ceiling and lights surfaces; emissiveIntensity only brightens the bulb.
      // Values above 1 are fine; tone mapping compresses them for the screen.
      const pulse = 0.5 + 0.5 * Math.sin(elapsed * 1.2);
      light.intensity = 0.4 + pulse * 2.2;
      material.emissiveIntensity = 0.5 + pulse * 3;
    },
  };
}
