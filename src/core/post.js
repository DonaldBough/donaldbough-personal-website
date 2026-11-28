import { RenderPipeline } from 'three/webgpu';
import { pass, mrt, output, emissive } from 'three/tsl';
import { bloom } from 'three/addons/tsl/display/BloomNode.js';

export function createPost(renderer, scene, camera) {
  const pipeline = new RenderPipeline(renderer);
  const scenePass = pass(scene, camera);
  scenePass.setMRT(mrt({ output, emissive }));

  const sceneColor = scenePass.getTextureNode('output');
  const emissiveNode = scenePass.getTextureNode('emissive');

  // Bloom bright emission without blurring the lit scene color.
  const bloomPass = bloom(emissiveNode, 0.26, 0.35, 0.91);
  pipeline.outputNode = sceneColor.add(bloomPass);

  return { pipeline, scenePass };
}
