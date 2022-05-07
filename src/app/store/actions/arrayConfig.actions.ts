import { createAction, props } from '@ngrx/store';
import { ArrayConfig } from '../reducers/arrayConfig.reducer';

export const setConfig = createAction('[TransducerConfig] set', props<ArrayConfig>());
