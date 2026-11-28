import { Color, MeshStandardNodeMaterial } from 'three/webgpu';
import { hash, materialEmissive, mix, mx_noise_float, normalView, positionLocal, positionView, smoothstep, time, uniform, vec2, vec3 } from 'three/tsl';

function hum(seed) {
  return mx_noise_float(vec2(time.mul(0.55), seed.toFloat()), 0.03, 1);
}

function flicker(seed, rate, chance, depth) {
  const clock = time.mul(rate);
  const bucket = clock.floor().toUint();
  const phase = clock.fract();
  const pulse = smoothstep(0.02, 0.13, phase).mul(smoothstep(0.48, 0.8, phase).oneMinus());
  const event = hash(bucket.add(seed.mul(65537))).lessThan(chance).select(1, 0);
  return pulse.mul(event).mul(depth).oneMinus();
}

function tubeColor(color) {
  const facing = normalView.dot(positionView.negate().normalize()).clamp(0, 1);
  return mix(uniform(new Color(color)), vec3(1), facing.pow(12));
}

function damagedEnd(length, seed) {
  const end = smoothstep(0.30, 0.32, positionLocal.x.div(length));
  return mix(1, flicker(seed, 3, 0.35, 0.76).mul(0.62), end);
}

export function createNeonTubeMaterial(color, length, index, damaged) {
  const material = new MeshStandardNodeMaterial({ color: 0x000000, roughness: 0.75 });
  const seed = uniform(index, 'uint');
  const chance = hash(seed).mul(0.018).add(0.012);
  const brightness = hum(seed).mul(flicker(seed, 3, chance, 0.38));
  const segment = damaged ? damagedEnd(length, seed.add(67)) : 1;
  material.emissiveNode = tubeColor(color).mul(3.5).mul(brightness).mul(segment);
  return material;
}

export function createNeonSignMaterial(texture) {
  const material = new MeshStandardNodeMaterial({
    color: 0x000000, map: texture, emissive: 0xffffff, emissiveMap: texture, emissiveIntensity: 1.35, transparent: true,
  });
  const seed = uniform(91, 'uint');
  material.emissiveNode = materialEmissive.mul(hum(seed)).mul(flicker(seed, 3, 0.08, 0.55));
  return material;
}
