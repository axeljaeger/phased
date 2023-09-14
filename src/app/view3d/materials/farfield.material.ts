import { Scene } from '@babylonjs/core/scene';
import { ShaderMaterial } from '@babylonjs/core/Materials/shaderMaterial';

import { glsl } from '../../utils/webgl.utils';
import { excitationBufferMaxElementsDefine } from '../../utils/excitationbuffer';

const vertexSource = glsl`
  precision highp float;
  #include<ExcitationBuffer>
  uniform highp int numElements;
  uniform float dynamicRange;
  uniform float k;

  // Uniforms
  uniform mat4 worldViewProjection;

  // Attributes
  attribute vec3 position;
  attribute vec2 uv;

  // Varying
  out highp vec3 r;
  out highp vec2 uvf;

  void main(void) {
    vec2 result = vec2(0,0);

    // Rework to process two elements at a time
    for (int i = 0; i < numElements; ++i) {
        ExcitationElement element = excitation.elements[i];
        vec2 argv = element.position.xy*uv;
        //float argument = k*(argv.x+argv.y) + element.delay*omega;
        float argument = k*(argv.x+argv.y) + element.phasor.x;
        result += vec2(cos(argument), sin(argument));
    }

    //float tf = abs(2*(texture(transducerFactor,.25*uv+vec2(.5,.5)).x)-.5);
    float tf = 1.0;
    float af = length(result);

    float db_val = 10.0*log((af*tf)/float(numElements));
    float shifted_val = db_val+dynamicRange;
    float absresult = clamp(shifted_val/dynamicRange,0.0,1.0);

    vec3 direction = vec3(
      position.xy,
      clamp(sqrt(1.0-pow(position.x, 2.0)-pow(position.y, 2.0)), 0.0, 1.0)
    );

    gl_Position = worldViewProjection * vec4(direction * absresult * 0.02, 1.0);

    r = position;
    uvf = uv;
  }
`;
const fragmentSource = glsl`
  precision highp float;
  #include<ExcitationBuffer>
 
  uniform highp int numElements;

  uniform sampler2D viridisSampler;
  uniform float globalPhase;

  uniform float k;
  uniform float t;

  uniform float dynamicRange;

  in highp vec3 r;
  in highp vec2 uvf;

  void main(void) {
    vec2 result = vec2(0,0);

    for (int i = 0; i < numElements; ++i) {
        ExcitationElement element = excitation.elements[i];
        vec2 argv = element.position.xy*uvf;
        float argument = k*(argv.x+argv.y) + element.phasor.x;
        result += vec2(cos(argument), sin(argument));
    }
    
    float intensity;
    intensity = 0.5 + 0.5 * length(result) / (float(numElements));
    glFragColor = texture(viridisSampler, vec2(intensity, 0.375)); 
  }
`;

export class FarfieldMaterial extends ShaderMaterial {
  constructor(scene: Scene) {
    super('FarfieldMaterial', scene, {
      vertexSource,
      fragmentSource,
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
        "world",
        "worldView",
        "worldViewProjection",
        "view",
        "projection",
        "globalPhase",
        "k",
        "t",
        "dynamicRange",
        "numElements",
      ],
      uniformBuffers: [
        'excitation'
      ],
      samplers: ['viridisSampler'],
      defines: [
        "#define INSTANCES", 
        excitationBufferMaxElementsDefine
      ]
    });

    this.backFaceCulling = false;
  }
}
