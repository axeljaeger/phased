import { Texture } from '@babylonjs/core/Materials/Textures/texture';
import { Scene } from '@babylonjs/core/scene';
import { ShaderMaterial } from '@babylonjs/core/Materials/shaderMaterial';

import { glsl } from '../utils/webgl.utils';
import { excitationBufferMaxElementsDefine } from '../utils/excitationbuffer';

const rayleighVertexShaderCode = glsl`
  precision highp float;

  // Uniforms
  uniform mat4 worldViewProjection;

  // Attributes
  attribute vec3 position;

  // Varying
  out highp vec3 r;

  void main(void) {
    gl_Position = worldViewProjection * vec4(position, 1.0);
    r = position;
  }
`;
const rayleighFragmentShaderCode = glsl`
  precision highp float;
  #include<ExcitationBuffer>

  uniform sampler2D coolwarmSampler;
  uniform float globalPhase;

  uniform float k;
  uniform float t;
  uniform float omega;

  uniform int viewmode;
  uniform float dynamicRange;

  uniform int numElements;

  in highp vec3 r;

  void main(void) {
    vec2 elongation = vec2(0,0); // Complex number

    for (int j = 0; j < numElements; ++j) {
      ExcitationElement elm = excitation.elements[j];
      float d = distance(elm.position.xyz, r);
      float oodd = 1.0/pow(d,2.0);

      float amplitude = elm.phasor.x;
      float area = elm.phasor.y;
      float delay = elm.phasor.z;
      
      float argz = (d*k - delay*omega - t);
      elongation += vec2(cos(argz), sin(argz))*amplitude*area*oodd;
    } 
  
    glFragColor = vec4(.5 + elongation.x, .5-elongation.x, 0.5,1);

    // float intensity;
    // if (viewmode == 0) { // Elongation
    //   intensity = 0.5 + (.5*elongation.x + .25) / (float(numElements)*dynamicRange);
    //   glFragColor = texture(coolwarmSampler, vec2(intensity, 0.375));
    // } else if (viewmode == 1) { // Magnitude
    //   //intensity = 0.25*length(elongation) / numsources;
    //   intensity = log(length(elongation) / float(numElements))/log(10.0f);
    //   glFragColor = texture(coolwarmSampler, vec2(intensity, 1));
    // } else if (viewmode == 2) { // Phase
    //   intensity = (atan(elongation.y,elongation.x)/(3.14) + .25);
    //   glFragColor = texture(coolwarmSampler, vec2(intensity, 1));
    // }
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
        "globalPhase",
        "k",
        "t",
        "omega",
        "viewmode",
        "dynamicRange"
      ],
      uniformBuffers: [
        'excitation'
      ],
      samplers: ['coolwarmSampler'],
      defines: [
        "#define INSTANCES", 
        excitationBufferMaxElementsDefine
      ]
    });

    this.backFaceCulling = false;
    const coolWarmTexture = new Texture('assets/coolwarm.png', scene);
    coolWarmTexture.wrapU = Texture.CLAMP_ADDRESSMODE;
    this.setTexture('coolwarmSampler', coolWarmTexture);
  }
}
