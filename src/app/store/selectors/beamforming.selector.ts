import { createFeatureSelector } from "@ngrx/store";
import { Beamforming } from "../reducers/beamforming.reducer";

export const selectBeamforming = createFeatureSelector<Beamforming>('beamforming');