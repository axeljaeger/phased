import { ArrayConfig } from "./reducers/arrayConfig.reducer";

export type AppState = {
    environment: {
        speedOfSound: number;
    },
    arrayConfig: ArrayConfig
}