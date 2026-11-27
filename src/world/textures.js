import * as THREE from 'three/webgpu';

// Procedural textures drawn with the 2D canvas API, so the lab needs no image assets yet.
// Each function returns a THREE.CanvasTexture.

function createCanvas(width, height = width) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return { canvas, ctx: canvas.getContext('2d') };
}

function toTexture(canvas, { repeat = [1, 1], color = true } = {}) {
  // This wraps the canvas as a GPU texture; RepeatWrapping and repeat tile it, and anisotropy keeps it sharp at grazing angles.
  // SRGBColorSpace marks color data so lighting maths uses linear space; leave it off for data maps such as roughness or bump.
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(repeat[0], repeat[1]);
  texture.anisotropy = 8;
  if (color) texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// Scatter soft, semi-transparent blotches to break up flat colors.
function addGrime(ctx, size, { count = 400, color = '0,0,0', maxAlpha = 0.06, maxRadius = 18 } = {}) {
  for (let i = 0; i < count; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const r = Math.random() * maxRadius + 1;
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, r);
    gradient.addColorStop(0, `rgba(${color},${Math.random() * maxAlpha})`);
    gradient.addColorStop(1, `rgba(${color},0)`);
    ctx.fillStyle = gradient;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }
}

function addSpeckle(ctx, size, count, alpha) {
  for (let i = 0; i < count; i++) {
    const shade = Math.random() > 0.5 ? 255 : 0;
    ctx.fillStyle = `rgba(${shade},${shade},${shade},${Math.random() * alpha})`;
    ctx.fillRect(Math.random() * size, Math.random() * size, 1.5, 1.5);
  }
}

// Glossy black floor tiles. floorGlowTexture() draws the matching cyan grid lines for the emissive map.
export function floorTexture(repeat) {
  const size = 1024;
  const { canvas, ctx } = createCanvas(size);
  const tile = size / 4;
  for (let y = 0; y < 4; y++) {
    for (let x = 0; x < 4; x++) {
      ctx.fillStyle = (x + y) % 2 ? '#0b0c11' : '#111319';
      ctx.fillRect(x * tile, y * tile, tile, tile);
    }
  }
  addSpeckle(ctx, size, 8000, 0.05);
  addGrime(ctx, size, { count: 300, maxAlpha: 0.08, maxRadius: 60 });
  return toTexture(canvas, { repeat });
}

export function floorGlowTexture(repeat) {
  const size = 1024;
  const { canvas, ctx } = createCanvas(size);
  const tile = size / 4;
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, size, size);
  ctx.strokeStyle = '#19e6ff';
  ctx.lineWidth = 3;
  for (let i = 0; i <= 4; i++) {
    ctx.beginPath();
    ctx.moveTo(i * tile, 0);
    ctx.lineTo(i * tile, size);
    ctx.moveTo(0, i * tile);
    ctx.lineTo(size, i * tile);
    ctx.stroke();
  }
  return toTexture(canvas, { repeat });
}

// Gunmetal wall panels with dark seams and rivets.
export function wallTexture(repeat) {
  const size = 1024;
  const { canvas, ctx } = createCanvas(size);
  ctx.fillStyle = '#1d2029';
  ctx.fillRect(0, 0, size, size);
  addSpeckle(ctx, size, 12000, 0.06);
  addGrime(ctx, size, { count: 200, maxAlpha: 0.12, maxRadius: 90 });

  const panel = size / 2;
  for (let i = 0; i <= 2; i++) {
    ctx.fillStyle = '#08090c';
    ctx.fillRect(i * panel - 4, 0, 8, size);
    ctx.fillRect(0, i * panel - 4, size, 8);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.fillRect(i * panel + 4, 0, 2, size);
    ctx.fillRect(0, i * panel + 4, size, 2);
  }
  ctx.fillStyle = '#3a3f4c';
  for (let y = 0; y < 2; y++) {
    for (let x = 0; x < 2; x++) {
      for (const [dx, dy] of [[24, 24], [panel - 24, 24], [24, panel - 24], [panel - 24, panel - 24]]) {
        ctx.beginPath();
        ctx.arc(x * panel + dx, y * panel + dy, 5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
  return toTexture(canvas, { repeat });
}

// Darker horizontal slats for the lower half of the walls.
export function wainscotTexture(repeat) {
  const size = 512;
  const { canvas, ctx } = createCanvas(size);
  ctx.fillStyle = '#13151b';
  ctx.fillRect(0, 0, size, size);
  for (let y = 0; y < size; y += 64) {
    ctx.fillStyle = '#07080b';
    ctx.fillRect(0, y, size, 5);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.fillRect(0, y + 5, size, 2);
  }
  addSpeckle(ctx, size, 4000, 0.05);
  return toTexture(canvas, { repeat });
}

// Black ceiling panels.
export function ceilingTexture(repeat) {
  const size = 512;
  const { canvas, ctx } = createCanvas(size);
  ctx.fillStyle = '#0e0f14';
  ctx.fillRect(0, 0, size, size);
  addSpeckle(ctx, size, 3000, 0.06);
  ctx.strokeStyle = '#050609';
  ctx.lineWidth = 10;
  ctx.strokeRect(0, 0, size, size);
  return toTexture(canvas, { repeat });
}

// Soft white glow used for additive halos: a horizontal band ('strip') or a round blob ('spot').
export function glowTexture(shape) {
  const { canvas, ctx } = createCanvas(256, shape === 'strip' ? 64 : 256);
  const { width, height } = canvas;
  if (shape === 'strip') {
    const vertical = ctx.createLinearGradient(0, 0, 0, height);
    vertical.addColorStop(0, 'rgba(255,255,255,0)');
    vertical.addColorStop(0.5, 'rgba(255,255,255,1)');
    vertical.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = vertical;
    ctx.fillRect(0, 0, width, height);
    // Fade out the ends.
    ctx.globalCompositeOperation = 'destination-in';
    const horizontal = ctx.createLinearGradient(0, 0, width, 0);
    horizontal.addColorStop(0, 'rgba(255,255,255,0)');
    horizontal.addColorStop(0.05, 'rgba(255,255,255,1)');
    horizontal.addColorStop(0.95, 'rgba(255,255,255,1)');
    horizontal.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = horizontal;
    ctx.fillRect(0, 0, width, height);
  } else {
    const radial = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    radial.addColorStop(0, 'rgba(255,255,255,1)');
    radial.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = radial;
    ctx.fillRect(0, 0, width, height);
  }
  const texture = toTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

// Glowing neon lettering on a transparent background.
export function neonSignTexture(text, color, { width = 1024, height = 160 } = {}) {
  const { canvas, ctx } = createCanvas(width, height);
  ctx.font = `bold ${height * 0.55}px "Courier New", monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = color;
  ctx.lineWidth = 6;
  for (const blur of [40, 20, 8]) {
    ctx.shadowBlur = blur;
    ctx.strokeStyle = color;
    ctx.strokeText(text, width / 2, height / 2);
  }
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#fff4fd';
  ctx.fillText(text, width / 2, height / 2);
  const texture = toTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

// Simple framed placeholder "photo" until real images are added.
export function photoPlaceholderTexture(seed) {
  const { canvas, ctx } = createCanvas(512, 384);
  const hue = (seed * 67) % 360;
  const sky = ctx.createLinearGradient(0, 0, 0, 384);
  sky.addColorStop(0, `hsl(${hue}, 45%, 70%)`);
  sky.addColorStop(1, `hsl(${(hue + 40) % 360}, 40%, 35%)`);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, 512, 384);

  ctx.fillStyle = `hsl(${(hue + 180) % 360}, 25%, 20%)`;
  ctx.beginPath();
  ctx.moveTo(0, 384);
  for (let x = 0; x <= 512; x += 32) ctx.lineTo(x, 240 + Math.sin(x * 0.02 + seed) * 50);
  ctx.lineTo(512, 384);
  ctx.fill();

  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  ctx.font = 'bold 28px Courier New';
  ctx.fillText(`PHOTO ${seed + 1}`, 24, 48);
  return toTexture(canvas);
}

// A glowing terminal screen. Call draw() again to update the text.
export function createScreenTexture({ color = '#19e6ff', background = '#02080d' } = {}) {
  const { canvas, ctx } = createCanvas(512, 384);
  const texture = toTexture(canvas);

  function draw(lines, cursorVisible) {
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, 512, 384);
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 8;
    ctx.font = '22px Courier New';
    lines.forEach((line, i) => ctx.fillText(line, 24, 44 + i * 30));
    if (cursorVisible) ctx.fillRect(24, 44 + lines.length * 30 - 20, 12, 22);
    ctx.shadowBlur = 0;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    for (let y = 0; y < 384; y += 3) ctx.fillRect(0, y, 512, 1);
    texture.needsUpdate = true;
  }

  return { texture, draw };
}
