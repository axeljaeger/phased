import { Scene } from '@babylonjs/core/scene';
import { ShaderMaterial } from '@babylonjs/core/Materials/shaderMaterial';

import '@babylonjs/core/Shaders/ShadersInclude/instancesDeclaration'
import '@babylonjs/core/Shaders/ShadersInclude/instancesVertex'

const glsl = (x: TemplateStringsArray) => x;

const transducerVertexShaderCode = glsl`
  precision highp float;

  // Attributes
  attribute vec3 position;
  attribute vec2 uv;
  attribute float selected;

  #include<instancesDeclaration>

  // Uniforms
  uniform mat4 worldViewProjection;

  // Varying
  varying vec2 vUV;
  varying float vSelected;


  void main(void) {
  #include<instancesVertex>
    gl_Position = worldViewProjection * finalWorld* vec4(position, 1.0);
    vUV = uv;
    vSelected = selected;
  }
`;

const transducerFragmentShaderCode = glsl`
  precision highp float;

  varying vec2 vUV;
  varying float vSelected;

  uniform float globalPhase;
  uniform float transducerDiameter;

  uniform float innerRadius;

  // based on https://www.desultoryquest.com/blog/drawing-anti-aliased-circular-points-using-opengl-slash-webgl/
  void main(void) {
    float r = 0.0, delta = 0.0, alpha = 1.0;
    vec2 cxy = 2.0 * vUV - 1.0;
    r = dot(cxy, cxy);
    delta = fwidth(r);
    alpha = smoothstep(innerRadius - delta, innerRadius + delta, r) - smoothstep(1.0 - delta, 1.0 + delta, r);
    gl_FragColor = vec4(0.5*(1.0 + sin(globalPhase)), vSelected, 0.5*(1.0 - sin(globalPhase)), alpha);
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
          "uv",
          "selected"
        ],
        uniforms: [
          "world",
          "worldView",
          "worldViewProjection",
          "view",
          "projection",
          "parameter",
          "transducerDiameter",
          "innerRadius"
        ],
        needAlphaBlending: true,
      }
    );
    this.backFaceCulling = false;
  }
}