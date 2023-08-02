import { createAction, createFeature, createReducer, on } from '@ngrx/store';

const initialState = 343;

export const setSpeedOfSound = createAction('[Environment] setSpeedOfSound');

const reducer = createReducer(
  initialState,
  on(setSpeedOfSound, (state) : number => state),
);

export const environmentFeature = createFeature({
  name: 'environment', 
  reducer
});