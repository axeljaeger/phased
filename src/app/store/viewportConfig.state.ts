import { createAction, createActionGroup, createFeature, createReducer, createSelector, on, props } from '@ngrx/store';

export enum Results {
    Farfield,
    RayleighIntegral
}

interface ViewportState {   
    enabledResults: Array<Results>
}

const initialState : ViewportState = { enabledResults: [Results.Farfield]};

export const ResultsActions = createActionGroup({
  source: 'ViewportConfig',
  events: {
    setResultVisible: props<{result: Results, visible : boolean}>(),
  },
});


const reducer = createReducer(
initialState,
  on(ResultsActions.setResultVisible, (state, args) : ViewportState => {
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
                    (results: Results[]) => results?.includes(result))
    })
})