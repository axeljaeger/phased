import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { glsl } from './webgl.utils';

export const excitationBufferMaxElements = 20;
export const excitationBufferMaxElementsDefine = `#define MAX_ELEMENTS ${excitationBufferMaxElements}`;
export const excitationBufferElementSize = 8;

export interface ExcitationElement {
    pos: Vector3;
    phase: number;
    amplitude: number;
  }

// Think about using tagged template to directly replace
// the MAX_ELEMENTS. But need extension of glsl tag function.
export const excitationBufferInclude = glsl`
  struct ExcitationElement { // size per element: 8
    vec4 position; // offset 0
    vec4 phasor; // 0: amplitude, 1: area, 2: delay, 3: dummy // Offset  16
  };

  layout(std140) uniform ExcitationBuffer
  {
    ExcitationElement elements[MAX_ELEMENTS];
  } excitation;
`;

export function createExcitationBuffer() {
    return new Float32Array(excitationBufferElementSize * excitationBufferMaxElements);
}

export function setExcitationElement(position : Vector3, buffer: Float32Array, index : number) {
    const elementOffset = excitationBufferElementSize * index;
    position.toArray(buffer, elementOffset);
    
    buffer[elementOffset + 4] = 1; // amplitude
    buffer[elementOffset + 5] = 1; // area
    buffer[elementOffset + 6] = 0; // phase
    buffer[elementOffset + 7] = 0; // zero  
}