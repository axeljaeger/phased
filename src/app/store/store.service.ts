import { computed } from '@angular/core';
import { signalStore, withMethods, withState, patchState, withComputed } from '@ngrx/signals';

import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { presets } from '../presets';


import { withViewportConfig } from './viewportConfig.state';
import { withSelection } from './selection.state';
import { withRayleigh } from './rayleigh.state';
import { withExport } from './export.state';
import { withBeamforming } from './beamforming.state';

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
      { length: Math.max(Math.ceil((end - start) / step)+1, 0) },
      (_, i) => start + i * step
  );
};

export interface RangeKpi {
  firstZero: number | null;
  secondZero: number | null;
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

const uraPositions = (uraConfig : UraConfig) => {
    const countX: number = uraConfig.elementsX;
    const countY: number = uraConfig.elementsY;
    const pitchX: number = uraConfig.pitchX;
    const pitchY: number = uraConfig.pitchY;

    const sizeXH = (countX - 1) * pitchX / 2.0;
    const sizeYH = (countY - 1) * pitchY / 2.0;

    const excitation: Transducer[] = [];

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

const spiralPositions = (spiralConfig: SpiralConfig) =>
    Array.from(Array(spiralConfig.elementCount).keys()).map(i => {
      const arrayIndex = (i + (spiralConfig.startWithZero ? 0 : 1));
      const radius = spiralConfig.diameter/2 * Math.sqrt(arrayIndex / spiralConfig.elementCount);
      const phi = 2 * Math.PI * arrayIndex * (1 + Math.sqrt(5)) / 2;
      return {
        name: `Transducer ${arrayIndex}`,
        pos: new Vector3(Math.cos(phi), Math.sin(phi)).scale(radius),
        enabled: false,
        selected: false
      }
    });
  
const circularPositions = (circularConfig : CircularConfig) =>
Array.from(Array(circularConfig.elementCount).keys()).map(i => {
    const phi = i * 2 * Math.PI / circularConfig.elementCount;
    return {
    name: `Transducer ${i}`,
    pos: new Vector3(Math.cos(phi), Math.sin(phi)).scale(circularConfig.diameter / 2),
    enabled: false,
    selected: false
    }
});

export const StoreService = signalStore(
    { providedIn: 'root' },
  withState<{arrayConfig: ArrayConfig}>({arrayConfig: presets[0]}),
  withMethods((store) => ({
    setConfig: (newConfig: ArrayConfig) => {
      patchState(store, { arrayConfig: { ...store.arrayConfig(),  ...newConfig} });
    },
    setTransducerDiameter: (diameter: number | null) => {
      patchState(store, {
        arrayConfig: { ...store.arrayConfig(),  transducerDiameter: diameter ?? store.arrayConfig().transducerDiameter},
      });
    },
    setEnvironment: (environment: Partial<Environment>) => {
      patchState(store, { 
        arrayConfig:{
          ...store.arrayConfig(),
          environment: {
            ...store.arrayConfig().environment,
            ...environment,
          },
        }});
    }})),
  withComputed((store) => {
    const k = computed(() => {
        const env = store.arrayConfig().environment;
        return 2 * Math.PI * frequencyFromBase(env.excitationFrequencyBase, env.excitationFrequencyMultiplier) / env.speedOfSound
    });
    const transducers = computed(() => {
        const arrayConfig = store.arrayConfig().config;    
        switch (arrayConfig.type) {
            case 'ura':
                return uraPositions(arrayConfig)
            case 'spiral':
                return spiralPositions(arrayConfig);
            case 'circular':
                return circularPositions(arrayConfig);
            default:
                return [];
        }
    });
    
    const patternU = computed(() => 
        (u : number) => transducers().reduce((acc, t) => {
            const argv = { x: t.pos.x * u, y: t.pos.y * 0 };
            //float argument = k*(argv.x+argv.y) + element.delay*omega;
            const argument = k() * (argv.x+argv.y) //+ element.phasor.x;
            return acc + Math.cos(argument) 
    },0));

    const patternV = computed(() => 
        (v : number) => transducers().reduce((acc, t) => {
            const argv = { x: t.pos.x * 0, y: t.pos.y * v };
            //float argument = k*(argv.x+argv.y) + element.delay*omega;
            const argument = k() * (argv.x+argv.y) //+ element.phasor.x;
            return acc + Math.cos(argument) 
    },0));

    const derivativeU = computed(() =>  (u : number) =>
        // Sum up over all transducers at particular position x
        transducers().reduce((acc, t) => {
            const argv = { x: t.pos.x * u, y: t.pos.y * 0 };
            //float argument = k*(argv.x+argv.y) + element.delay*omega;
            const argument = k() * (argv.x+argv.y) //+ element.phasor.x;

            // We need the derivative of the argument of sin.
            // As the argument is t.pos.x * x, the derivative is t.pos.x
            const factor = t.pos.x;
            const addVal = -factor*k()*Math.sin(argument);
            const newVal = acc + addVal;
            return newVal;
        }, 0)
    );

    const derivativeV = computed(() =>  (v : number) =>
    // Sum up over all transducers at particular position x
        transducers().reduce((acc, t) => {
            const argv = { x: t.pos.x * 0, y: t.pos.y * v};
            //float argument = k*(argv.x+argv.y) + element.delay*omega;
            const argument = k() * (argv.x+argv.y) //+ element.phasor.x;

            // We need the derivative of the argument of sin.
            // As the argument is t.pos.x * x, the derivative is t.pos.x
            const factor = t.pos.y;
            const addVal = -factor*k()*Math.sin(argument);
            const newVal = acc + addVal;
            return newVal;
        }, 0)
    );

    const samplePatternU = computed(() => range(-1, 1, 2 / 180).map((u) => ({x: u, y: Math.abs(patternU()(u)) / transducers().length})));
        //const samplePatternU = createSelector(selectPatternU, selectTransducers, (pattern, transducers) => range(-1, 1, 0.001).map((u) => ({x: u, y: Math.abs(pattern(u)) / transducers.length})));
    const samplePatternV = computed(() => range(-1, 1, 0.001).map((v) => ({x: v, y: Math.abs(patternV()(v)) / transducers().length})));

    const fnbwU = computed(() => {
        const firstZero = newtonMethod(patternU(), derivativeU(), 0 - 0.001, 1e-7, 100);
        const secondZero = newtonMethod(patternU(), derivativeU(), 0 + 0.001, 1e-7, 100);
        console.log("FNBW: firstZero: ", firstZero, " secondZero: ", secondZero);
        return { firstZero, secondZero };
    });

    const fnbwV = computed(() => {
        const firstZero = newtonMethod(patternV(), derivativeV(), 0 - 0.001, 1e-7, 100);
        const secondZero = newtonMethod(patternV(), derivativeV(), 0 + 0.001, 1e-7, 100);
        console.log("FNBW: firstZero: ", firstZero, " secondZero: ", secondZero);
        return { firstZero, secondZero };
    });

    const hpbwU = computed(() => {
        const max = patternU()(0);
        const hbpwfactor = 1.0 / Math.sqrt(2);
        const ff = (x : number) => patternU()(x) - ((hbpwfactor) * max);
        const firstZero = newtonMethod(ff, derivativeU(), 0 - 0.001, 1e-7, 100);
        const secondZero = newtonMethod(ff, derivativeU(), 0 + 0.001, 1e-7, 100);
        console.log("HPBW: firstZero: ", firstZero, " secondZero: ", secondZero);
        return { firstZero, secondZero };
    });

    const hpbwV = computed(() => {
        const max = patternV()(0);
        const hbpwfactor = 1.0 / Math.sqrt(2);
        const ff = (x : number) => patternV()(x) - ((hbpwfactor) * max);
        const firstZero = newtonMethod(ff, derivativeV(), 0 - 0.001, 1e-7, 100);
        const secondZero = newtonMethod(ff, derivativeV(), 0 + 0.001, 1e-7, 100);
        console.log("HPBW: firstZero: ", firstZero, " secondZero: ", secondZero);
        return { firstZero, secondZero };
    });

    return { k, transducers, patternU, patternV, derivativeU, derivativeV, 
             samplePatternU, samplePatternV, fnbwU, fnbwV, hpbwU, hpbwV,
             };
  }),
  withViewportConfig(),
  withSelection(),
  withRayleigh(),
  withExport(),
  withBeamforming()
);