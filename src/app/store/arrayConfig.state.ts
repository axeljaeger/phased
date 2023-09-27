import { Vector2, Vector3 } from '@babylonjs/core/Maths/math.vector';
import { createActionGroup, createFeature, createReducer, createSelector, on, props } from '@ngrx/store';

export interface ArrayConfig {
  arrayType: string;
  uraConfig: {
    elementsX: number;
    elementsY: number;
    pitchX: number;
    pitchY: number;
  };
  circularConfig: {
    radius: number;
    elements: number;
  };
}

export interface Transducer {
  name: string;
  pos: Vector3;
  enabled: boolean;
  selected: boolean;
}

export const initialState: ArrayConfig = {
  arrayType: 'ura',
  uraConfig: {
    elementsX: 2,
    elementsY: 2,
    pitchX: 0.0043,
    pitchY: 0.0043,
  },
  circularConfig: {
    radius: 2,
    elements: 2,
  },
};

export const ArrayConfigActions = createActionGroup({
  source: 'TransducerConfig',
  events: {
    setConfig: props<ArrayConfig>(),
    setPitchX: props<{pitch: number}>(),
    setPitchY: props<{pitch: number}>(),
    scaleArray: props<{scale: Vector2}>(),
  },
});

export const reducer = createReducer(
  initialState,
  on(ArrayConfigActions.setConfig, (state: ArrayConfig, newConfig): ArrayConfig => {
    return {
      ...newConfig,
    };
  }),
  on(ArrayConfigActions.setPitchX, (state: ArrayConfig, pitch): ArrayConfig =>
  ({
    ...state,
    uraConfig: {
      ...state.uraConfig,
      pitchX: pitch.pitch,
    },
  })
  ),
  on(ArrayConfigActions.setPitchY, (state: ArrayConfig, pitch): ArrayConfig =>
  ({
    ...state,
    uraConfig: {
      ...state.uraConfig,
      pitchY: pitch.pitch,
    },
  })
  ),
  on(ArrayConfigActions.scaleArray, (state: ArrayConfig, pitch): ArrayConfig =>
  { 
    console.log(pitch.scale.x, pitch.scale.y);
    return ({
    ...state,
    uraConfig: {
      ...state.uraConfig,
      pitchX: state.uraConfig.pitchX * pitch.scale.x,
      pitchY: state.uraConfig.pitchY * pitch.scale.y,
    },
  })}
  ),
);

export const arrayConfigFeature = createFeature({
  name: 'arrayConfig', 
  reducer,
  extraSelectors: ({selectArrayConfigState}) => ({
    selectTransducers: createSelector(
      selectArrayConfigState,
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
      })
  })
});
  