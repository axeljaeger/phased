
import { createActionGroup, createFeature, createReducer, on, props } from '@ngrx/store';

export interface Point {
  x: number;
  y: number;
}


export enum ResultSpace {
  UV = 'uv',
  AZEL = 'azel',
}

export interface ResultValues {
  u: Point[];
  v: Point[];
}

export type Result = {
  u: Point[];
  v: Point[];
  resultUnits: ResultSpace;
}

const initialState: Result = {
  u: [],
  v: [],
  resultUnits: ResultSpace.UV,
};

export const ExportActions = createActionGroup({
  source: 'Export',
  events: {
    setResultValues: props<ResultValues>(),
    setResultUnit: props<{ unit: ResultSpace }>(),
  },
});

const reducer = createReducer(
  initialState,
  on(ExportActions.setResultValues, (state, args): Result =>
  ({
    ...state,
    ...args,
  })
  ),
  on(ExportActions.setResultUnit, (state, { unit }): Result =>
  ({
    ...state,
    resultUnits: unit,
  })
  )
);

export const exportFeature = createFeature({
  name: "export",
  reducer
});
