import { createActionGroup, createFeature, createReducer, on, props } from '@ngrx/store';
import { ResultAspect } from 'src/app/view3d/materials/rayleigh.material';

export enum ResultSet {
  XZPlane,
  YZPlane,
  CutCube,
}

export interface RayleighState {
  aspect: ResultAspect;
  resultSet: ResultSet;
}

export const initialState: RayleighState = {
  aspect: ResultAspect.Elongation,
  resultSet: ResultSet.XZPlane
};

export const RayleighResultActions = createActionGroup({
  source: 'RayleighResult',
  events: {
    setResultAspect: props<{ aspect: ResultAspect }>(),
    setResultSet: props<{ resultSet: ResultSet }>(),
  },
});

const reducer = createReducer(
  initialState,
  on(RayleighResultActions.setResultAspect, (state, args): RayleighState => ({ ...state, aspect: args.aspect })),
  on(RayleighResultActions.setResultSet, (state, args): RayleighState => ({ ...state, resultSet: args.resultSet }))
);

export const RayleighFeature = createFeature({
  name: 'rayleigh',
  reducer
});

