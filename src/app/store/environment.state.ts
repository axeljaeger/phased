import { createActionGroup, createFeature, createReducer, createSelector, on, props } from '@ngrx/store';

export enum Multiplier {
  Hz = 'Hz',
  kHz = 'kHz',
  MHz = 'MHz',
}

export enum EnvironmentHint {
  Air = 'Air',
  Water = 'Water',
  Custom = 'Custom'
};

export interface EnvironmentState {
  speedOfSound: number;
  environmentHint: EnvironmentHint;
  excitationFrequencyBase: number;
  multiplier: Multiplier;
}

const initialState : EnvironmentState = {
  speedOfSound: 343,
  environmentHint: EnvironmentHint.Air,
  excitationFrequencyBase: 40,
  multiplier: Multiplier.kHz
}

export const EnvironmentActions = createActionGroup({
  source: 'Environment',
  events: {
    setEnvironment: props<Partial<{environmentHint: EnvironmentHint | null, speedOfSound: number | null}>>(),
    setExcitationFrequency: props<Partial<{excitationFrequencyBase: number | null, multiplier: Multiplier | null}>>(),
  },
});

const reducer = createReducer(
  initialState,
  on(EnvironmentActions.setEnvironment, (state, args) => ({
    ...state,
    environmentHint: args.environmentHint ?? state.environmentHint,
    speedOfSound: args.environmentHint === EnvironmentHint.Air ? 343 : args.environmentHint === EnvironmentHint.Water ? 1480 : args.speedOfSound ?? state.speedOfSound
  })),
  on(EnvironmentActions.setExcitationFrequency, (state, args) => ({
    ...state,
    excitationFrequencyBase: args.excitationFrequencyBase ?? state.excitationFrequencyBase,
    multiplier: args.multiplier ?? state.multiplier
  }))
);

export const frequencyFromBase = (base : number, multiplier : Multiplier) => base *
  (multiplier === Multiplier.Hz ? 1 :
   multiplier === Multiplier.kHz ? 1e3 :
    1e6);

export const environmentFeature = createFeature({
  name: 'environment',
  reducer,
  extraSelectors: ({ selectEnvironmentState }) => {
    const selectFrequency = createSelector(selectEnvironmentState, (state) => frequencyFromBase(state.excitationFrequencyBase, state.multiplier));
    const selectK = createSelector(selectEnvironmentState, selectFrequency, (state, frequency) => 2 * Math.PI * frequency / state.speedOfSound);
    return {
      selectFrequency,
      selectK
    }
  }
});