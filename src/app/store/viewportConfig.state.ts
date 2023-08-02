import { createFeature, createReducer, createSelector, on } from '@ngrx/store';

export enum Results {
    Farfield,
    RayleighIntegral
}

interface ViewportState {   
    enabledResults: Array<Results>
}

const initialState : ViewportState = { enabledResults: [Results.RayleighIntegral]};

import { createAction, props } from '@ngrx/store';

export const setResultVisible = createAction('[ViewportConfig] setResultVisible', props<{result: Results, visible : boolean}>());

const reducer = createReducer(
initialState,
  on(setResultVisible, (state: ViewportState, args: {result: Results, visible: boolean}) : ViewportState => {
    const results = new Set<Results>(state.enabledResults);  
    if (args.visible) {
        results.add(args.result);
    } else {
        results.delete(args.result);
    }
    return {...state, enabledResults: [...results]};
    })
);

export const ViewportFeature = createFeature({
    name: 'viewportConfig',
    reducer,
    extraSelectors: ({selectEnabledResults}) => ({
        selectResultEnabled: 
            (result: Results) => 
                createSelector(
                    selectEnabledResults, 
                    (results: Array<Results>) => results.includes(result))
    })
})