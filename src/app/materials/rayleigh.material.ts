import { Texture } from '@babylonjs/core/Materials/Textures/texture';
import { Scene } from '@babylonjs/core/scene';
import { ShaderMaterial } from '@babylonjs/core/Materials/shaderMaterial';

const glsl = (x: TemplateStringsArray) => x;

const rayleighVertexShaderCode = glsl`
  precision highp float;

  // Attributes
  attribute vec3 position;
  attribute vec2 uv;

  // Uniforms
  uniform mat4 worldViewProjection;

  // Varying
  varying vec2 vUV;
  varying vec3 globalPos;

  void main(void) {
    gl_Position = worldViewProjection * vec4(position, 1.0);
    globalPos = position;
    vUV = uv;
  }
`;
const rayleighFragmentShaderCode = glsl`
  precision highp float;

  varying vec2 vUV;
  varying vec3 globalPos;

  uniform sampler2D coolwarmSampler;
  uniform float globalPhase;

  void main(void) {
      float phase = globalPos.x / 0.086;
      float amplitude = sin(phase + globalPhase);
      float u = 0.5*(1.0+amplitude);
      gl_FragColor = texture2D(coolwarmSampler, vec2(u, 0.5));
  }
`;

export class RayleighMaterial extends ShaderMaterial {
  constructor(scene: Scene) {
    super('RayleighMaterial', scene, {
      vertexSource: rayleighVertexShaderCode,
      fragmentSource: rayleighFragmentShaderCode
    }, {
      attributes: [
        "position",
        "normal",
        "uv",
        'world0',
        'world1',
        'world2',
        'world3',
      ],
      uniforms: [
        'excitation',
        "world",
        "worldView",
        "worldViewProjection",
        "view",
        "projection",
        "globalPhase"
      ],
      samplers: ['coolwarmSampler'],
      defines: ["#define INSTANCES"]
    });

    this.backFaceCulling = false;
    const coolWarmTexture = new Texture('assets/coolwarm.png', scene);
    coolWarmTexture.wrapU = Texture.CLAMP_ADDRESSMODE;
    this.setTexture('coolwarmSampler', coolWarmTexture);
  }
}
