import { createFeatureSelector, createSelector } from "@ngrx/store";
import { SelectionState } from "../reducers/selection.reducer";

export const selectSelection = createFeatureSelector<SelectionState>('selection');
