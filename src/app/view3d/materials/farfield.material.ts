import { Scene } from '@babylonjs/core/scene';
import { ShaderMaterial } from '@babylonjs/core/Materials/shaderMaterial';

import { excitationBufferMaxElementsDefine } from '../../utils/excitationbuffer';
import { ShaderLanguage } from '@babylonjs/core/Materials/shaderLanguage';

const vertexSource = /* wgsl */`
  #include<ExcitationBuffer>
  uniform numElements : i32;
  uniform dynamicRange : f32;
  uniform k : f32;

  // Uniforms
  uniform worldViewProjection : mat4x4<f32>;

  // Attributes
  attribute position : vec3<f32>;
  attribute uv : vec2<f32>;

  // Varying
  varying r : vec3<f32>;
  varying uvf : vec2<f32>;
  varying absresult : f32;

  @vertex
  fn main(input : VertexInputs) -> FragmentInputs {
    var result = vec2<f32>(0,0);

    // Rework to process two elements at a time
    for (var i = 0; i < uniforms.numElements; i++) {
        let element = excitation.elements[i];
        let argv = element.position.xy*vertexInputs.uv;
        //float argument = k*(argv.x+argv.y) + element.delay*omega;
        let argument = uniforms.k*(argv.x+argv.y) + element.phasor.x;
        result += vec2<f32>(cos(argument), sin(argument));
    }

    //float tf = abs(2*(texture(transducerFactor,.25*uv+vec2(.5,.5)).x)-.5);
    const tf = 1.0;
    let af = length(result);

    let db_val = 10.0*log((af*tf)/f32(uniforms.numElements));
    let shifted_val = db_val+uniforms.dynamicRange;
    let absresult = saturate(shifted_val/uniforms.dynamicRange);

    // 1- x^2 - y^2
    let possquared = vertexInputs.position * vertexInputs.position;
    let direction = vec3<f32>(
      vertexInputs.position.xy,
      saturate(sqrt(1.0-possquared.x-possquared.y))
    );

    vertexOutputs.position = uniforms.worldViewProjection * vec4(direction * absresult * 0.02, 1.0);
    vertexOutputs.r = vertexInputs.position;
    vertexOutputs.uvf = vertexInputs.uv;
    vertexOutputs.absresult = absresult;
  }
`;
const fragmentSource = /* wgsl */`
  #include<ExcitationBuffer>
 
  uniform numElements : i32;

  var viridisSampler : sampler;
  var viridisTexture : texture_2d<f32>;

  uniform globalPhase : f32;

  uniform k : f32;
  uniform t : f32;

  uniform dynamicRange : f32;

  varying r : vec3<f32>;
  varying uvf : vec2<f32>;
  varying absresult : f32;

  @fragment
  fn main(input : FragmentInputs) -> FragmentOutputs {
    // var result = vec2<f32>(0,0);

    // for (var i = 0; i < uniforms.numElements; i++) {
    //     let element = excitation.elements[i];
    //     let argv = element.position.xy*fragmentInputs.uvf;
    //     let argument = uniforms.k*(argv.x+argv.y) + element.phasor.x;
    //     result += vec2(cos(argument), sin(argument));
    // }
    
    //let intensity = 0.5 + 0.5 * length(result) / (f32(uniforms.numElements));
    fragmentOutputs.color = textureSample(viridisTexture, viridisSampler, vec2(fragmentInputs.absresult, 0.375)); 
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
      ],
      uniforms: [
        "worldViewProjection",
        "projection",
        "globalPhase",
        "k",
        "t",
        "dynamicRange",
        "numElements",
      ],
      uniformBuffers: [
        "Scene", "Mesh", 'excitation'
      ],
      samplers: ['viridisSampler'],
      defines: [
        "#define INSTANCES", 
        excitationBufferMaxElementsDefine
      ],
      shaderLanguage: ShaderLanguage.WGSL,
    });

    this.backFaceCulling = false;
    this.wireframe = false;
  }
}
