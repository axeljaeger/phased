import { createAction, props } from '@ngrx/store';
import { ResultAspect } from 'src/app/materials/rayleigh.material';
import { ArrayConfig } from '../reducers/arrayConfig.reducer';

export const setConfig = createAction('[TransducerConfig] set', props<ArrayConfig>());
export const setResultAspect = createAction('[RayleightResultAspect] set', props<{aspect: ResultAspect}>());

