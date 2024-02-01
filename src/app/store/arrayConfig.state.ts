import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { createActionGroup, createFeature, createReducer, createSelector, on, props } from '@ngrx/store';

export interface ArrayConfig {
  arrayType: string;
  uraConfig: {
    elementsX: number;
    elementsY: number;
    pitchX: number;
    pitchY: number;
  };
  roundConfig: {
    diameter: number;
    elementCount: number;
    startElement: number;
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
    elementsX: 3,
    elementsY: 2,
    pitchX: 0.0043,
    pitchY: 0.0043,
  },
  roundConfig: {
    diameter: 0.05,
    elementCount: 5,
    startElement: 0,
  },
};

export const ArrayConfigActions = createActionGroup({
  source: 'TransducerConfig',
  events: {
    setConfig: props<ArrayConfig>(),
  },
});

export const reducer = createReducer(
  initialState,
  on(ArrayConfigActions.setConfig, (state: ArrayConfig, newConfig): ArrayConfig => {
    return {
      ...newConfig,
    };
  }),
);

export const arrayConfigFeature = createFeature({
  name: 'arrayConfig',
  reducer,
  extraSelectors: ({ selectArrayConfigState, selectArrayType }) => ({
    selectTransducers: createSelector(
      selectArrayConfigState,
      (arrayConfig: ArrayConfig) => {
        const excitation: Array<Transducer> = [];

        switch (arrayConfig.arrayType) {
          case 'ura':
            {
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
              return excitation;
            }
          case 'spiral':
            return spiralPositions(arrayConfig.roundConfig.diameter / 2, arrayConfig.roundConfig.elementCount, arrayConfig.roundConfig.startElement);
          case 'circular':
            return circularPositions(arrayConfig.roundConfig.diameter / 2, arrayConfig.roundConfig.elementCount);
          default:
            return [];
        }
      }),
      isUra: createSelector(selectArrayType, (type: string) => type === 'ura'),
  })
});

const spiralPositions = (maxRadius: number, numElements: number, startElement: number) =>
  Array.from(Array(numElements).keys()).map(i => {
    const arrayIndex = (i + startElement);
    const radius = maxRadius * Math.sqrt(arrayIndex / numElements);
    const phi = 2 * Math.PI * arrayIndex * (1 + Math.sqrt(5)) / 2;
    return {
      name: `Transducer ${arrayIndex}`,
      pos: new Vector3(Math.cos(phi), Math.sin(phi)).scale(radius),
      enabled: false,
      selected: false
    }
  });

  const circularPositions = (radius: number, numElements: number) =>
  Array.from(Array(numElements).keys()).map(i => {
    const phi = i * 2 * Math.PI / numElements;
    return {
      name: `Transducer ${i}`,
      pos: new Vector3(Math.cos(phi), Math.sin(phi)).scale(radius),
      enabled: false,
      selected: false
    }
  });
