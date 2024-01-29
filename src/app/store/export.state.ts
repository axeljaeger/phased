
import { createActionGroup, createFeature, createReducer, on, props } from '@ngrx/store';

export interface Point {
  x: number;
  y: number;
}

export interface Result {
  u: Point[];
  v: Point[];
}

const initialState: Result = {
  u: [],
  v: [],
};

export const ExportActions = createActionGroup({
  source: 'Export',
  events: {
    'setResults': props<Result>(),
  },
});

export const reducer = createReducer(
  initialState,
  on(ExportActions.setResults, (state: Result, args): Result =>
  ({
    ...state,
    u: args.u,
    v: args.v,
  })
  ),
);

export const exportFeature = createFeature({
  name: "export",
  reducer
});
