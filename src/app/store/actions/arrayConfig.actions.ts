import { createActionGroup, props } from '@ngrx/store';
import { ArrayConfig } from '../reducers/arrayConfig.reducer';

export const ArrayConfigActions = createActionGroup({
    source: 'TransducerConfig',
    events: {
      'setConfig': props<ArrayConfig>(),
      'setPitchX': props<{pitch: number}>(),
      'setPitchY': props<{pitch: number}>(),
    },
  });