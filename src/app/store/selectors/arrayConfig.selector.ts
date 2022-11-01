import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { createFeatureSelector, createSelector } from "@ngrx/store";
import { ArrayConfig } from "../reducers/arrayConfig.reducer";

export interface Transducer {
    name: string;
    pos: Vector3;
    enabled: boolean;
    selected: boolean;
}

export const selectArrayConfig = createFeatureSelector<ArrayConfig>('arrayConfig');

export const selectTransducers = createSelector(
  selectArrayConfig,
  (arrayConfig: ArrayConfig ) => {
    const excitation : Array<Transducer> = [];
    if (arrayConfig.arrayType === 'ura') {
      const countX: number = arrayConfig.uraConfig.elementsX;
      const countY: number = arrayConfig.uraConfig.elementsY;
      const pitchX: number = arrayConfig.uraConfig.pitchX;
      const pitchY: number = arrayConfig.uraConfig.pitchY;

      const sizeXH = (countX - 1) * pitchX / 2.0;
      const sizeYH = (countY - 1) * pitchY / 2.0;

      for (let y = 0; y < countY; y++) {
        for (let x = 0; x < countX; x++) {
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
  });