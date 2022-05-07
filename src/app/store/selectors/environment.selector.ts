import { createFeatureSelector } from "@ngrx/store";
export const selectEnvironment = createFeatureSelector<number>('environment');