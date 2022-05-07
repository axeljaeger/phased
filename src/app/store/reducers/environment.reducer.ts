import { createReducer, on } from '@ngrx/store';
import { setSpeedOfSound } from '../actions/environment.actions';

export const initialState = 343;

export const environmentReducer = createReducer(
  initialState,
  on(setSpeedOfSound, (state) : number => state),
);