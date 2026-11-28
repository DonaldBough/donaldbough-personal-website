import { RenderPipeline } from 'three/webgpu';
import { pass, mrt, output, emissive } from 'three/tsl';
import { bloom } from 'three/addons/tsl/display/BloomNode.js';

export function createPost(renderer, scene, camera) {
  const pipeline = new RenderPipeline(renderer);
  const scenePass = pass(scene, camera);
  scenePass.setMRT(mrt({ output, emissive }));

  const sceneColor = scenePass.getTextureNode('output');
  const emissiveNode = scenePass.getTextureNode('emissive');

  // YOUR TURN: Build bloom(emissiveNode, strength, radius, threshold) to soften bright emission.
  // YOUR TURN: Replace the fallback with sceneColor.add(bloomPass) to layer the glow over the scene.
  pipeline.outputNode = sceneColor;

  return { pipeline, scenePass };
}
