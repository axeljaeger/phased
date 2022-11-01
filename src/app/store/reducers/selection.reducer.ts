import { createReducer, on } from '@ngrx/store';
import { setTransducerHovered, clearHover } from '../actions/selection.actions';

export interface SelectionState {
    hovered: number[];
    selected: number[];

}

export const initialState : SelectionState = {
    hovered: [],
    selected: []
};

export const selectionReducer = createReducer(
  initialState,
  on(setTransducerHovered, (state, args) : SelectionState => { return {...state, hovered: [args.transducerId]} }),
  on(clearHover, (state) : SelectionState => { return {...state, hovered: []}}),
);