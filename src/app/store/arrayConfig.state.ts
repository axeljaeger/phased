import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { createActionGroup, createFeature, createReducer, createSelector, on, props } from '@ngrx/store';
import { presets } from '../presets';

export type Nullable<T> = { [K in keyof T]: T[K] | null };

const newtonMethod = (
  f: (x: number) => number, 
  df: (x: number) => number, 
  x0: number, 
  tolerance: number = 1e-7, 
  maxIterations: number = 100
): number | null => {
  let x = x0;

  for (let i = 0; i < maxIterations; i++) {
      const fx = f(x);
      const dfx = df(x);

      // console.log("newton iteration i: ", i, " x: ", x, " fx: ", fx, " dfx: ", dfx);

      if (Math.abs(dfx) < 1e-10) {
          console.error("Ableitung zu nahe an 0. Abbruch.");
          return null; // Vermeidung der Division durch Null
      }

      const d = fx / dfx;
      const stepSize = Math.min(0.1,Math.abs(d))*Math.sign(d);
      
      
      const xNew = x - stepSize;

      if (Math.abs(xNew - x) < tolerance) return xNew; // Konvergenz erreicht

      x = xNew;
  }

  console.error("Maximale Anzahl an Iterationen erreicht.");
  return null;
};

const range = (start :number, end : number, step = 1) => {
  if (step === 0) throw new Error("Step size cannot be zero");
  return Array.from(
      { length: Math.max(Math.ceil((end - start) / step), 0) },
      (_, i) => start + i * step
  );
};

export interface RangeKpi {
  firstZero: number | null;
  secondZero: number | null;
  width: number;
}

export type Kind = 'Academic' | 'Industrial';

export interface Citation {
  kind: Kind;
  title: string;
  authors: string;
  year: number;
  url: string;
  urlTitle: string;
}

export interface CircularConfig {
  type: 'circular';
  diameter: number;
  elementCount: number;
}

export type FrequencyMultiplier = 'Hz' | 'kHz' | 'MHz';

const FrequencyMultiplierValue : Record<FrequencyMultiplier, number> = {
  'Hz': 1,
  'kHz': 1e3,
  'MHz': 1e6
};

export const frequencyFromBase = (base : number, multiplier : FrequencyMultiplier) => base * FrequencyMultiplierValue[multiplier];

export type EnvironmentHint = 'Air' | 'Water' | 'Custom';
export interface Environment {
  environmentHint: EnvironmentHint;
  speedOfSound: number;

  excitationFrequencyBase: number;
  excitationFrequencyMultiplier: FrequencyMultiplier; // rename to frequencyMultiplier
}

export interface SpiralConfig {
  type: 'spiral';
  diameter: number;
  elementCount: number;
  startWithZero: boolean;
}

export interface UraConfig {
  type: 'ura';
  elementsX: number;
  elementsY: number;
  pitchX: number;
  pitchY: number;
}


export interface ArrayConfig {
  name: string;
  environment: Environment;
  citation: Citation | null;
  config: UraConfig | CircularConfig | SpiralConfig;
  transducerDiameter: number;
}

export interface Transducer {
  name: string;
  pos: Vector3;
  enabled: boolean;
  selected: boolean;
}

export const ArrayConfigActions = createActionGroup({
  source: 'TransducerConfig',
  events: {
    setConfig: props<ArrayConfig>(),
    setTransducerDiameter: props<{ diameter: number | null}>(),
    setEnvironment: props<Nullable<Partial<Environment>>>(),
    setExcitationFrequency: props<Nullable<Partial<{excitationFrequencyBase: number, excitationFrequencyMultiplier: FrequencyMultiplier}>>>(),
  },
});

const reducer = createReducer(
  presets[0], // initialState
  on(ArrayConfigActions.setConfig, (state, newConfig) : ArrayConfig => {
    return {
      ...state,
      ...newConfig,
    };
  }),
  on(ArrayConfigActions.setTransducerDiameter, (state, { diameter }): ArrayConfig => {
    return {
      ...state,
      transducerDiameter: diameter ?? state.transducerDiameter
    };
  }),
    on(ArrayConfigActions.setEnvironment, (state, args) => ({
      ...state,
      environment: {
        ...state.environment,
        environmentHint: args.environmentHint ?? state.environment.environmentHint,
        speedOfSound: args.environmentHint === 'Air' ? 343 : args.environmentHint === 'Water' ? 1480 : args.speedOfSound ?? state.environment.speedOfSound
      }
    })),
    on(ArrayConfigActions.setExcitationFrequency, (state, args) => ({
      ...state,
      environment: {
        ...state.environment,
        excitationFrequencyBase: args.excitationFrequencyBase ?? state.environment.excitationFrequencyBase,
        excitationFrequencyMultiplier: args.excitationFrequencyMultiplier ?? state.environment.excitationFrequencyMultiplier
      }
    }))
);

export const arrayConfigFeature = createFeature({
  name: 'arrayConfig',
  reducer,
  extraSelectors: ({ selectArrayConfigState, selectConfig, selectEnvironment }) => {
      const selectK = createSelector(selectEnvironment, state => 2 * Math.PI * frequencyFromBase(state.excitationFrequencyBase, state.excitationFrequencyMultiplier) / state.speedOfSound);
      const selectTransducers = createSelector(
      selectArrayConfigState,
      (arrayConfig: ArrayConfig) => {
        const excitation: Transducer[] = [];

        switch (arrayConfig.config.type) {
          case 'ura':
            {
              const countX: number = arrayConfig.config.elementsX;
              const countY: number = arrayConfig.config.elementsY;
              const pitchX: number = arrayConfig.config.pitchX;
              const pitchY: number = arrayConfig.config.pitchY;

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
            return spiralPositions(arrayConfig.config.diameter / 2, arrayConfig.config.elementCount, arrayConfig.config.startWithZero);
          case 'circular':
            return circularPositions(arrayConfig.config.diameter / 2, arrayConfig.config.elementCount);
          default:
            return [];
        }
      });

      const isUra = createSelector(selectConfig, config => config.type === 'ura');
      const selectPattern = createSelector(selectTransducers, selectK, (transducers, k)=> {
        return (x : number) => 
          transducers.reduce((acc, t) => {
                const argv = { x: t.pos.x * x, y: t.pos.y * 0 };
                //float argument = k*(argv.x+argv.y) + element.delay*omega;
                const argument = k * (argv.x+argv.y) //+ element.phasor.x;
            return acc + Math.cos(argument) 
          },0) });
      ;
      const selectDerivativeX = createSelector(selectTransducers, selectK, (transducers, k) => {
        return (x : number) =>
          // Sum up over all transducers at particular position x
          transducers.reduce((acc, t) => {
                const argv = { x: t.pos.x * x, y: t.pos.y * 0 };
                //float argument = k*(argv.x+argv.y) + element.delay*omega;
                const argument = k * (argv.x+argv.y) //+ element.phasor.x;


                // We need the derivative of the argument of sin.
                // As the argument is t.pos.x * x, the derivative is t.pos.x
                const factor = t.pos.x;

                const addVal = -factor*k*Math.sin(argument);
                const newVal = acc + addVal;
                return newVal;
          }, 0)
      }); 
      const samplePattern = createSelector(selectPattern,       (pattern) => range(-1, 1, 0.001).map((x) => ({x, y: Math.abs(pattern(x)) / 64})));
      const sampleDerrivate = createSelector(selectDerivativeX, (derrivative) => range(-1, 1, 0.01).map((val) => derrivative(val)));
      const selectFnbw = createSelector(selectPattern, selectDerivativeX, (f,df) => {
        const firstZero = newtonMethod(f, df, 0 - 0.001, 1e-7, 100);
        const secondZero = newtonMethod(f, df, 0 + 0.001, 1e-7, 100);

        console.log("FNBW: firstZero: ", firstZero, " secondZero: ", secondZero);


        return { firstZero, secondZero, width: secondZero! - firstZero! };
      });
      const selectHpbw = createSelector(selectPattern, selectDerivativeX, (f,df) => {
        const max = f(0);
        const ff = (x : number) => f(x) - 0.5 * max;
        const firstZero = newtonMethod(ff, df, 0 - 0.001, 1e-7, 100);
        const secondZero = newtonMethod(ff, df, 0 + 0.001, 1e-7, 100);

        console.log("HPBW: firstZero: ", firstZero, " secondZero: ", secondZero);

        return { firstZero, secondZero, width: secondZero! - firstZero! };
      });

      return { selectTransducers, isUra, selectFnbw, selectHpbw, samplePattern, sampleDerrivate, selectPattern, selectK };
  }
});

const spiralPositions = (maxRadius: number, numElements: number, startWithZero: boolean) =>
  Array.from(Array(numElements).keys()).map(i => {
    const arrayIndex = (i + (startWithZero ? 0 : 1));
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
