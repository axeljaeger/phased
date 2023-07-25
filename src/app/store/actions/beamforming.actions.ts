import { createActionGroup, props } from '@ngrx/store';

export const BeamformingActions = createActionGroup({
    source: 'Beamforming',
    events: {
      'setU': props<{u: number}>(),
      'setV': props<{v: number}>(),
    },
  });