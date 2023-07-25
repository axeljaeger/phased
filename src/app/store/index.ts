import { ArrayConfig } from "./reducers/arrayConfig.reducer";
import { Beamforming } from "./reducers/beamforming.reducer";

export enum Results {
    Farfield,
    RayleighIntegral
}

export type AppState = {
    environment: {
        speedOfSound: number;
    },
    arrayConfig: ArrayConfig;
    visibleResults: Array<Results>;
    beamforming: Beamforming;
}