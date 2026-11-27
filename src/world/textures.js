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

// 4x4 checkerboard of worn vinyl lab tiles.
export function floorTexture(repeat) {
  const size = 1024;
  const { canvas, ctx } = createCanvas(size);
  const tile = size / 4;
  const colors = ['#b9b6a6', '#4c5a53'];

  for (let y = 0; y < 4; y++) {
    for (let x = 0; x < 4; x++) {
      ctx.fillStyle = colors[(x + y) % 2];
      ctx.fillRect(x * tile, y * tile, tile, tile);
    }
  }
  addSpeckle(ctx, size, 20000, 0.12);
  addGrime(ctx, size, { count: 900, maxAlpha: 0.08, maxRadius: 60 });

  ctx.strokeStyle = 'rgba(20, 20, 18, 0.6)';
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

// Painted concrete for the upper walls, with drip streaks.
export function wallTexture(repeat) {
  const size = 1024;
  const { canvas, ctx } = createCanvas(size);
  ctx.fillStyle = '#7d887f';
  ctx.fillRect(0, 0, size, size);
  addSpeckle(ctx, size, 30000, 0.1);
  addGrime(ctx, size, { count: 600, maxAlpha: 0.1, maxRadius: 80 });

  for (let i = 0; i < 40; i++) {
    const x = Math.random() * size;
    const length = Math.random() * size * 0.5;
    const gradient = ctx.createLinearGradient(0, 0, 0, length);
    gradient.addColorStop(0, 'rgba(30, 25, 15, 0.18)');
    gradient.addColorStop(1, 'rgba(30, 25, 15, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(x, 0, Math.random() * 4 + 1, length);
  }
  return toTexture(canvas, { repeat });
}

// Small white ceramic tiles for the lower half of the walls.
export function wainscotTexture(repeat) {
  const size = 512;
  const { canvas, ctx } = createCanvas(size);
  const count = 8;
  const tile = size / count;

  ctx.fillStyle = '#3a3d38';
  ctx.fillRect(0, 0, size, size);
  for (let y = 0; y < count; y++) {
    for (let x = 0; x < count; x++) {
      const shade = 200 + Math.random() * 25;
      ctx.fillStyle = `rgb(${shade}, ${shade}, ${shade - 12})`;
      ctx.fillRect(x * tile + 2, y * tile + 2, tile - 4, tile - 4);
    }
  }
  addGrime(ctx, size, { count: 300, color: '60,50,30', maxAlpha: 0.12, maxRadius: 40 });
  return toTexture(canvas, { repeat });
}

// Drop-ceiling acoustic panels.
export function ceilingTexture(repeat) {
  const size = 512;
  const { canvas, ctx } = createCanvas(size);
  ctx.fillStyle = '#a9a699';
  ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < 6000; i++) {
    ctx.fillStyle = `rgba(40, 40, 30, ${Math.random() * 0.25})`;
    ctx.beginPath();
    ctx.arc(Math.random() * size, Math.random() * size, Math.random() * 1.6, 0, Math.PI * 2);
    ctx.fill();
  }
  addGrime(ctx, size, { count: 120, color: '80,60,20', maxAlpha: 0.15, maxRadius: 50 });
  ctx.strokeStyle = '#d8d6cc';
  ctx.lineWidth = 10;
  ctx.strokeRect(0, 0, size, size);
  return toTexture(canvas, { repeat });
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

// A sign with centered text, e.g. above the door.
export function signTexture(text, { background = '#c9b23a', foreground = '#111', width = 512, height = 128 } = {}) {
  const { canvas, ctx } = createCanvas(width, height);
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = foreground;
  ctx.font = `bold ${height * 0.5}px Courier New`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, width / 2, height / 2);
  return toTexture(canvas);
}

// A green-phosphor CRT screen. Call draw() again to update the text.
export function createScreenTexture() {
  const { canvas, ctx } = createCanvas(512, 384);
  const texture = toTexture(canvas);

  function draw(lines, cursorVisible) {
    ctx.fillStyle = '#031208';
    ctx.fillRect(0, 0, 512, 384);
    ctx.fillStyle = '#7dffa1';
    ctx.shadowColor = '#7dffa1';
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
