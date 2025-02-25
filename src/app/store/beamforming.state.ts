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
    set: props<Partial<Beamforming>>(),
  },
});

const reducer = createReducer(
  initialState,
  on(BeamformingActions.setU, (state, args): Beamforming =>
  ({
    ...state,
    u: args.u
  })
  ),
  on(BeamformingActions.setV, (state, args): Beamforming =>
  ({
    ...state,
    v: args.v
  })
  ),
  on(BeamformingActions.reset, (state): Beamforming =>
  ({
    ...state,
    u: 0,
    v: 0,
  })
  ),
  on(BeamformingActions.setEnabled, (state, args): Beamforming =>
  ({
    ...state,
    enabled: args.enabled
  })
  ),
  on(BeamformingActions.setInteractive, (state, args): Beamforming =>
  ({
    ...state,
    interactive: args.interactive
  })
  ),
  on(BeamformingActions.set, (state, args): Beamforming =>
  ({
    ...state,
    ...args,
  })
  ),
);

export const beamformingFeature = createFeature({
  name: "beamforming",
  reducer
});
