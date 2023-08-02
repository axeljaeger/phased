import { 
  createActionGroup,
  createFeature, 
  createReducer,
  emptyProps, 
  props,
  on
} from '@ngrx/store';

export interface SelectionState {
  hovered: number[];
  selected: number[];
}

const initialState: SelectionState = {
  hovered: [],
  selected: []
};

export const SelectionActions = createActionGroup({
  source: 'Selection',
  events: {
    'Clear': emptyProps(),
    'Set': props<{ transducerId: number }>(),
  },
});

const selectionReducer = createReducer(
  initialState,
  on(SelectionActions.set, (state, args): SelectionState => ({ ...state, hovered: [args.transducerId] })),
  on(SelectionActions.clear, (state): SelectionState => ({ ...state, hovered: [] })),
);

export const selectionFeature = createFeature({
  name: 'selection',
  reducer: selectionReducer,
});