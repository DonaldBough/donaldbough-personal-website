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

function dip(phase, start, duration) {
  const progress = phase.sub(start).div(duration);
  return smoothstep(0, 0.2, progress).mul(smoothstep(0.7, 1, progress).oneMinus());
}

function stutter(seed) {
  const period = 3.4;
  const clock = time.div(period).add(hash(seed));
  const phase = clock.fract().mul(period);
  const start = hash(clock.floor().toUint().add(seed.mul(65537))).mul(0.55).add(0.25);
  return dip(phase, start, 0.23).add(dip(phase, start.add(0.31), 0.18)).mul(0.86).oneMinus();
}

function tubeColor(color) {
  const facing = normalView.dot(positionView.negate().normalize()).clamp(0, 1);
  return mix(uniform(new Color(color)), vec3(1), facing.pow(5));
}

function damagedEnd(length, seed) {
  const end = smoothstep(0.30, 0.32, positionLocal.x.div(length));
  return mix(1, flicker(seed, 2.5, 0.60, 0.84).mul(0.38), end);
}

export function createNeonTubeMaterial(color, length, index, { damaged, stuttering }) {
  const material = new MeshStandardNodeMaterial({ color: 0x000000, roughness: 0.75 });
  const seed = uniform(index, 'uint');
  const brightness = stuttering ? hum(seed).mul(stutter(seed)) : hum(seed);
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
