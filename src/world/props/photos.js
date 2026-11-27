import * as THREE from 'three/webgpu';
import { materials, mesh } from '../materials.js';
import { photoPlaceholderTexture } from '../textures.js';
import { content } from '../../content.js';

const PICTURE_HEIGHT = 0.5;
const MAT_MARGIN = 0.06;
const BORDER_MARGIN = 0.1;

// A row of framed photos. The group's origin is the center of the row, flush against a wall.
// Each frame starts at 4:3 and resizes to its photo's aspect ratio once the image loads.
export function createPhotoWall() {
  const group = new THREE.Group();
  const loader = new THREE.TextureLoader();
  const spacing = 1.05;
  const interactables = [];

  content.photos.forEach((photo, i) => {
    const material = new THREE.MeshStandardMaterial({ map: photoPlaceholderTexture(i), roughness: 0.4 });
    const frame = createFrame(material);
    frame.setAspect(4 / 3);
    frame.position.x = (i - (content.photos.length - 1) / 2) * spacing;
    frame.position.y = i % 2 === 0 ? 0 : 0.08;
    frame.rotation.z = (Math.random() - 0.5) * 0.03;

    if (photo.src) {
      loader.load(photo.src, (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = 4;
        material.map = texture;
        material.needsUpdate = true;
        frame.setAspect(texture.image.width / texture.image.height);
      });
    }

    group.add(frame);
    interactables.push({ object: frame, title: photo.title, body: photo.body });
  });

  return { object: group, interactables };
}

// Unit-sized border, mat and picture that setAspect() scales to fit a photo.
function createFrame(pictureMaterial) {
  const frame = new THREE.Group();
  const border = mesh(new THREE.BoxGeometry(1, 1, 0.04), materials.wood);
  border.position.z = 0.02;
  const mat = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshStandardMaterial({ color: 0xe8e4d8, roughness: 0.9 }));
  mat.position.z = 0.0405;
  const picture = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), pictureMaterial);
  picture.position.z = 0.042;
  frame.add(border, mat, picture);

  frame.setAspect = (aspect) => {
    const w = PICTURE_HEIGHT * aspect;
    const h = PICTURE_HEIGHT;
    picture.scale.set(w, h, 1);
    mat.scale.set(w + 2 * MAT_MARGIN, h + 2 * MAT_MARGIN, 1);
    border.scale.set(w + 2 * BORDER_MARGIN, h + 2 * BORDER_MARGIN, 1);
  };
  return frame;
}
