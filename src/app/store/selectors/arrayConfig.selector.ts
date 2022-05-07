import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { ArrayConfig } from "../reducers/arrayConfig.reducer";

export interface Transducer {
    name: string;
    pos: Vector3;
    enabled: boolean;
    selected: boolean;
}
  
export const selectTransducers = 
  (state: { arrayConfig: ArrayConfig } ) => {
    const excitation : Array<Transducer> = [];
    if (state.arrayConfig.arrayType === 'ura') {
      const countX: number = state.arrayConfig.uraConfig.elementsX;
      const countY: number = state.arrayConfig.uraConfig.elementsY;
      const pitchX: number = state.arrayConfig.uraConfig.pitchX;
      const pitchY: number = state.arrayConfig.uraConfig.pitchY;

      const sizeXH = (countX - 1) * pitchX / 2.0;
      const sizeYH = (countY - 1) * pitchY / 2.0;

      for (let x = 0; x < countX; x++) {
        for (let y = 0; y < countY; y++) {
          const xpos = -sizeXH + x * pitchX;
          const ypos = -sizeYH + y * pitchY;
          excitation.push({ 
            name: `Transducer ${y * countY + x}`,
            pos: new Vector3(xpos, ypos), 
            enabled: false,
            selected: false
          });
        }
      }
    }
    return excitation;
  };