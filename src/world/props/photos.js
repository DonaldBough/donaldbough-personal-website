import * as THREE from 'three/webgpu';
import { materials, mesh } from '../materials.js';
import { photoPlaceholderTexture } from '../textures.js';
import { content } from '../../content.js';

// A row of framed photos. The group's origin is the center of the row, flush against a wall.
export function createPhotoWall() {
  const group = new THREE.Group();
  const loader = new THREE.TextureLoader();
  const spacing = 0.95;
  const interactables = [];

  content.photos.forEach((photo, i) => {
    const frame = createFrame();
    frame.position.x = (i - (content.photos.length - 1) / 2) * spacing;
    frame.position.y = i % 2 === 0 ? 0 : 0.12;
    frame.rotation.z = (Math.random() - 0.5) * 0.03;

    const material = new THREE.MeshStandardMaterial({ map: photoPlaceholderTexture(i), roughness: 0.4 });
    if (photo.src) {
      loader.load(photo.src, (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        material.map = texture;
        material.needsUpdate = true;
      });
    }
    const picture = new THREE.Mesh(new THREE.PlaneGeometry(0.56, 0.42), material);
    picture.position.z = 0.042;
    frame.add(picture);

    group.add(frame);
    interactables.push({ object: frame, title: photo.title, body: photo.body });
  });

  return { object: group, interactables };
}

function createFrame() {
  const frame = new THREE.Group();
  const border = mesh(new THREE.BoxGeometry(0.76, 0.62, 0.04), materials.wood);
  border.position.z = 0.02;
  const mat = new THREE.Mesh(new THREE.PlaneGeometry(0.68, 0.54), new THREE.MeshStandardMaterial({ color: 0xe8e4d8, roughness: 0.9 }));
  mat.position.z = 0.0405;
  frame.add(border, mat);
  return frame;
}
