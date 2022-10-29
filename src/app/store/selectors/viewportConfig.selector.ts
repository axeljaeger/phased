import { createSelector, createFeatureSelector, } from "@ngrx/store";
import { Results } from "..";
export const selectEnabledResults = createFeatureSelector<Array<Results>>('visibleResults');
export const selectResultEnabled = (result: Results) =>
  createSelector(selectEnabledResults, (results: Array<Results>) => results.includes(result));
