import { Texture } from '@babylonjs/core/Materials/Textures/texture';
import { Scene } from '@babylonjs/core/scene';
import { ShaderMaterial } from '@babylonjs/core/Materials/shaderMaterial';

import { glsl } from '../../utils/webgl.utils';
import { excitationBufferMaxElementsDefine } from '../../utils/excitationbuffer';

const rayleighVertexShaderCode = glsl`
  precision highp float;
  #include<ExcitationBuffer>
  uniform highp int numElements;
  uniform float dynamicRange;
  uniform sampler2D coolwarmSampler;

  // Uniforms
  uniform mat4 worldViewProjection;

  // Attributes
  attribute vec3 position;

  // Varying
  out highp vec3 r;

  void main(void) {
    vec3 samplePosition = position;

    float az = atan(samplePosition.x,samplePosition.z);
    float el = atan(samplePosition.y, length(samplePosition.xz));
    vec2 uv = vec2(cos(el)* sin(az), sin(el));

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

    samplePosition.z = absresult;
    gl_Position = worldViewProjection * spherepos;
    r = position;
  }
`;
const rayleighFragmentShaderCode = glsl`
  precision highp float;
  #include<ExcitationBuffer>
  uniform highp int numElements;

  uniform sampler2D coolwarmSampler;
  uniform float globalPhase;

  uniform float k;
  uniform float t;
  uniform float omega;

  uniform float dynamicRange;

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
  
    //glFragColor = vec4(.5 + elongation.x, .5-elongation.x, 0.5,1);
    glFragColor = vec4(1.0 - float(numElements) / 10.0,float(numElements) / 10.0,0,1);  
    float intensity;
    intensity = 0.5 + (.5*elongation.x + .25) / (float(numElements)*dynamicRange);
    glFragColor = texture(coolwarmSampler, vec2(intensity, 0.375));
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
