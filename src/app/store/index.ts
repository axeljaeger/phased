import { ArrayConfig } from "src/app/store/reducers/arrayConfig.reducer";

export type AppState = {
    environment: {
        speedOfSound: number;
    },
    arrayConfig: ArrayConfig
}