import { createFeature, createReducer, on } from '@ngrx/store';
import { ResultAspect } from 'src/app/view3d/materials/rayleigh.material';

import { createAction, props } from '@ngrx/store';
import { ArrayConfig } from './arrayConfig.state';


export const initialState = ResultAspect.Elongation;

export const setConfig = createAction('[TransducerConfig] set', props<ArrayConfig>());
export const setResultAspect = createAction('[RayleightResultAspect] set', props<{aspect: ResultAspect}>());


const reducer = createReducer(
  initialState,
  on(setResultAspect, (state, args) : ResultAspect => args.aspect),
);

export const rayleighFeature = createFeature({
  name: 'rayleigh',
  reducer
});

