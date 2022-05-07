import { createAction, props } from '@ngrx/store';
import { ArrayConfig } from 'src/app/store/reducers/arrayConfig.reducer';

export const setConfig = createAction('[TransducerConfig] set', props<ArrayConfig>());
