import { createReducer, on } from '@ngrx/store';
import { ResultAspect } from 'src/app/view3d/materials/rayleigh.material';
import { setResultAspect } from '../actions/rayleigh.actions';

export const initialState = ResultAspect.Elongation;

export const rayleighReducer = createReducer(
  initialState,
  on(setResultAspect, (state, args) : ResultAspect => args.aspect),
);