import { createActionGroup, createFeature, createReducer, on, props } from '@ngrx/store';

export interface Beamforming {
  u: number;
  v: number;
}

const initialState: Beamforming = {
  u: 0,
  v: 0,
};

export const BeamformingActions = createActionGroup({
  source: 'Beamforming',
  events: {
    'setU': props<{u: number}>(),
    'setV': props<{v: number}>(),
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
  )
);

export const beamformingFeature = createFeature({
  name: "beamforming",
  reducer
});
