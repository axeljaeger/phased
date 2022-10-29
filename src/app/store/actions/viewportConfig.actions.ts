import { createAction, props } from '@ngrx/store';
import { Results } from '../index';

export const setResultVisible = createAction('[ViewportConfig] setResultVisible', props<{result: Results, visible : boolean}>());
