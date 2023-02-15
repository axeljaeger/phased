import { createAction, props } from '@ngrx/store';
import { ArrayConfig } from '../reducers/arrayConfig.reducer';

export const setConfig = createAction('[TransducerConfig] set', props<ArrayConfig>());
export const setPitchX = createAction('[TransducerConfig] setPitchX', props<{pitch: number}>());
