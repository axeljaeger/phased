import { createActionGroup, createFeature, createReducer, emptyProps, on, props } from '@ngrx/store';

export interface Beamforming {
  enabled: boolean;
  interactive: boolean;
  u: number;
  v: number;
}

const initialState: Beamforming = {
  enabled: false,
  interactive: false,
  u: 0,
  v: 0,
};

export const BeamformingActions = createActionGroup({
  source: 'Beamforming',
  events: {
    setU: props<{u: number}>(),
    setV: props<{v: number}>(),
    reset: emptyProps(),
    setEnabled: props<{enabled: boolean}>(),
    setInteractive: props<{interactive: boolean}>(),
    set: props<Beamforming>(),
  },
});

export const reducer = createReducer(
  initialState,
  on(BeamformingActions.setU, (state: Beamforming, args): Beamforming =>
  ({
    ...state,
    u: args.u
  })
  ),
  on(BeamformingActions.setV, (state: Beamforming, args): Beamforming =>
  ({
    ...state,
    v: args.v
  })
  ),
  on(BeamformingActions.reset, (state: Beamforming): Beamforming =>
  ({
    ...state,
    u: 0,
    v: 0,
  })
  ),
  on(BeamformingActions.setEnabled, (state: Beamforming, args): Beamforming =>
  ({
    ...state,
    enabled: args.enabled
  })
  ),
  on(BeamformingActions.setInteractive, (state: Beamforming, args): Beamforming =>
  ({
    ...state,
    interactive: args.interactive
  })
  ),
  on(BeamformingActions.set, (state: Beamforming, args: Beamforming): Beamforming =>
  ({
    ...args,
  })
  ),
);

export const beamformingFeature = createFeature({
  name: "beamforming",
  reducer
});
