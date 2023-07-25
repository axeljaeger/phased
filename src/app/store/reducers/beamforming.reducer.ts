import { createReducer, on } from '@ngrx/store';
import { BeamformingActions } from '../actions/beamforming.actions';

export interface Beamforming {
  u: number;
  v: number;
}

export const initialState: Beamforming = {
  u: 0,
  v: 0,
};

export const beamformingReducer = createReducer(
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
