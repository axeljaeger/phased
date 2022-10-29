import { ArrayConfig } from "./reducers/arrayConfig.reducer";

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
}