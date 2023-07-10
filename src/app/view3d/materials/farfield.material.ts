import { Scene } from '@babylonjs/core/scene';
import { ShaderMaterial } from '@babylonjs/core/Materials/shaderMaterial';

import { glsl } from '../../utils/webgl.utils';
import { excitationBufferMaxElementsDefine } from '../../utils/excitationbuffer';

const rayleighVertexShaderCode = glsl`
  precision highp float;
  #define M_PI 3.1415926535897932384626433832795
  #include<ExcitationBuffer>
  uniform highp int numElements;
  uniform float dynamicRange;
  uniform sampler2D viridisSampler;

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

    float pi = 3.141;
    float f = 40000.0;
    float c = 343.0;

    float omega = 2.0*pi*f;
    float k = omega / c;

    for (int i = 0; i < numElements; ++i) {
        ExcitationElement element = excitation.elements[i];
        vec2 argv = element.position.xy*uv;
        //float argument = k*(argv.x+argv.y) + element.delay*omega;
        float argument = k*(argv.x+argv.y); // + element.delay*omega;
        result += vec2(cos(argument), sin(argument));
    }

    //float tf = abs(2*(texture(transducerFactor,.25*uv+vec2(.5,.5)).x)-.5);
    float tf = 1.0;
    float af = length(result);

    float db_val = 10.0*log((af*tf)/float(numElements));
    float shifted_val = db_val+dynamicRange;
    float absresult = clamp(shifted_val/dynamicRange,0.0,1.0);

    float phi = atan(uv.y,uv.x);
    float theta = asin(length(uv));

    vec2 angles = vec2(theta,phi);
    vec2 sins = sin(angles);
    vec2 coss = cos(angles);

    vec4 spherepos = vec4(absresult*vec3(sins.x*coss.y,sins.y*sins.x,coss.x),1);
//    vec4 spherepos = vec4(uv.x,uv.y,tf,1);

    // samplePosition.z = absresult;
    // gl_Position = worldViewProjection * vec4(position.xy, af / float(numElements), 1.0);
    

    vec3 direction = vec3(
      position.x,
      position.y,
      clamp(1.0 / length(vec2(position.x, position.y)), 0.0, 1.0)
    );

    gl_Position = worldViewProjection * vec4(direction * absresult * 0.02, 1.0);

    r = position;
    uvf = uv;
  }
`;
const rayleighFragmentShaderCode = glsl`
  precision highp float;
  #include<ExcitationBuffer>
 
  uniform highp int numElements;

  uniform sampler2D viridisSampler;
  uniform float globalPhase;

  uniform float k;
  uniform float t;
  uniform float omega;

  uniform float dynamicRange;

  in highp vec3 r;
  in highp vec2 uvf;

  void main(void) {
    vec2 result = vec2(0,0);

    float pi = 3.141;
    float f = 40000.0;
    float c = 343.0;

    float omega = 2.0*pi*f;
    float k = omega / c;

    for (int i = 0; i < numElements; ++i) {
        ExcitationElement element = excitation.elements[i];
        vec2 argv = element.position.xy*uvf;
        float argument = k*(argv.x+argv.y); // + element.delay*omega;
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
        "world",
        "worldView",
        "worldViewProjection",
        "view",
        "projection",
        "globalPhase",
        "k",
        "t",
        "omega",
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
