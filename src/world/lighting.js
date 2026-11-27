import * as THREE from 'three/webgpu';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { ROOM } from './room.js';
import { mesh } from './materials.js';
import { quality } from '../core/device.js';

export function createLighting(scene, renderer) {
  // A faint image-based light so metals and glossy surfaces have something to reflect.
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.08;

  scene.background = new THREE.Color(0x020403);
  scene.fog = new THREE.FogExp2(0x030605, 0.045);

  scene.add(new THREE.HemisphereLight(0x9fb8aa, 0x1a1410, 0.25));

  const fixtures = [
    [-3, -2.5],
    [3, -2.5],
    [-3, 2.5],
    [3, 2.5],
  ].map(([x, z]) => createFixture(scene, x, z));

  // One fixture flickers, because every good horror lab has one.
  const flickering = fixtures[3];
  let flickerTimer = 0;

  const emergency = createEmergencyLight(scene, 3, ROOM.depth / 2 - 0.15);

  function update(dt, elapsed) {
    flickerTimer -= dt;
    if (flickerTimer <= 0) {
      const off = Math.random() < 0.35;
      flickering.setOn(off ? Math.random() * 0.15 : 1);
      flickerTimer = off ? Math.random() * 0.12 : Math.random() * 2.5;
    }
    emergency.update(elapsed);
  }

  return { update };
}

function createFixture(scene, x, z) {
  const { height } = ROOM;
  const intensity = 18;

  const housing = mesh(
    new THREE.BoxGeometry(1.3, 0.08, 0.35),
    new THREE.MeshStandardMaterial({ color: 0xb8b8b0, roughness: 0.5, metalness: 0.4 }),
    { castShadow: false },
  );
  housing.position.set(x, height - 0.04, z);

  const panelMaterial = new THREE.MeshStandardMaterial({ color: 0x000000, emissive: 0xe8fff2, emissiveIntensity: 2.5 });
  const panel = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.28), panelMaterial);
  panel.rotation.x = Math.PI / 2;
  panel.position.set(x, height - 0.081, z);

  const light = new THREE.SpotLight(0xe6fff0, intensity, 12, 1.25, 0.8, 1.6);
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

function createEmergencyLight(scene, x, z) {
  const material = new THREE.MeshStandardMaterial({ color: 0x200000, emissive: 0xff1a0a, emissiveIntensity: 2 });
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.07, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), material);
  bulb.rotation.x = Math.PI / 2;
  bulb.position.set(x, 2.95, z);

  const light = new THREE.PointLight(0xff2010, 1, 5, 2);
  light.position.set(x, 2.9, z - 0.1);
  scene.add(bulb, light);

  return {
    update(elapsed) {
      const pulse = 0.5 + 0.5 * Math.sin(elapsed * 2.5);
      light.intensity = 0.4 + pulse * 2.2;
      material.emissiveIntensity = 0.5 + pulse * 3;
    },
  };
}
