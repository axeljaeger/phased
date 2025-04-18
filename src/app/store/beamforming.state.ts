import { signalStoreFeature, withState, withMethods, patchState } from '@ngrx/signals';

export interface BeamformingState {
  enabled: boolean;
  interactive: boolean;
  u: number;
  v: number;
}

export const withBeamforming = () => signalStoreFeature(
  withState<{beamforming: BeamformingState}>({ beamforming: {
    enabled: false,
    interactive: false,
    u: 0,
    v: 0,
  }}),
  withMethods((store) => ({
    setU: (u: number) => {
      patchState(store, { beamforming: {...store.beamforming(), u }});
    },
    setV: (v: number) => {
      patchState(store, { beamforming: {...store.beamforming(),v }});
    },
    reset: () => {
      patchState(store, { beamforming: {...store.beamforming(),u: 0, v: 0 }});
    },
    setEnabled: (enabled: boolean) => {
      patchState(store, { beamforming: {...store.beamforming(),enabled }});
    },
    setInteractive: (interactive: boolean) => {
      patchState(store, { beamforming: {...store.beamforming(),interactive }});
    },
    setPartial: (partialState: Partial<BeamformingState>) => {
      patchState(store, {beamforming: {...store.beamforming(), ...partialState }});
    },
    resetBeamforming: () => {
      patchState(store, { beamforming: { ...store.beamforming(), u: 0, v: 0 } });
    }
  }))
);
