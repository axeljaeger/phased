import { createAction, props } from '@ngrx/store';

export const setTransducerHovered = createAction('[HoverSelection] set', props<{transducerId: number}>());
export const clearHover = createAction('[HoverSelection] clear');