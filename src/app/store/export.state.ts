
import { createActionGroup, createFeature, createReducer, on, props } from '@ngrx/store';
import { HoveredKpi } from '../sidebar/pure-components/kpi/kpi.component';

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
  hoveredKpi: HoveredKpi;
}

const initialState: Result = {
  u: [],
  v: [],
  resultUnits: ResultSpace.UV,
  hoveredKpi: '',
};

export const ExportActions = createActionGroup({
  source: 'Export',
  events: {
    setResultValues: props<ResultValues>(),
    setResultUnit: props<{ unit: ResultSpace }>(),
    setHoveredKpi: props<{ hoveredKpi: HoveredKpi }>(),
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
  }),
  ),
  on(ExportActions.setHoveredKpi, (state, { hoveredKpi }): Result =>
    ({
      ...state,
      hoveredKpi
    }),
  )
);

export const exportFeature = createFeature({
  name: "export",
  reducer
});
