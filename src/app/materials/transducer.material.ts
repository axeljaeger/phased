import { Scene } from '@babylonjs/core/scene';
import { ShaderMaterial } from '@babylonjs/core/Materials/shaderMaterial';

const glsl = (x: TemplateStringsArray) => x;

const transducerVertexShaderCode = glsl`
  precision highp float;

  // Attributes
  attribute vec3 position;
  attribute vec2 uv;

  #include<instancesDeclaration>

  // Uniforms
  uniform mat4 worldViewProjection;

  // Varying
  varying vec2 vUV;

  void main(void) {
  #include<instancesVertex>
    gl_Position = worldViewProjection * finalWorld* vec4(position, 1.0);
    vUV = uv;
  }
`;

const transducerFragmentShaderCode = glsl`
  precision highp float;

  varying vec2 vUV;

  uniform sampler2D textureSampler;
  uniform float globalPhase;
  uniform float transducerDiameter;

  void main(void) {
    if (length(vUV - vec2(.5,.5)) > 0.5) {
        discard;
    }

    gl_FragColor = vec4(0.5*(1.0 + sin(globalPhase)), 0, 0.5*(1.0 - sin(globalPhase)),1);
  }
`;

export class TransducerMaterial extends ShaderMaterial {
  constructor(scene: Scene) {
    super('TransducerMaterial', scene, {
      vertexSource: transducerVertexShaderCode,
      fragmentSource: transducerFragmentShaderCode
    },
      {
        attributes: [
          "position",
          "normal",
          "uv"
        ],
        uniforms: [
          "world",
          "worldView",
          "worldViewProjection",
          "view",
          "projection",
          "parameter",
          "transducerDiameter"
        ]
      }
    );
    this.backFaceCulling = false;
  }
}