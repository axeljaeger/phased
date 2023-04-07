import { createReducer, on } from '@ngrx/store';
import { Results } from '..';
import { setResultVisible } from '../actions/viewportConfig.actions';

const initialState : Array<Results> = [Results.RayleighIntegral];

export const viewportConfigReducer = createReducer(
initialState,
  on(setResultVisible, (state: Array<Results>, args: {result: Results, visible: boolean}) : Array<Results> => {
    const results = new Set<Results>(state);  
    if (args.visible) {
        results.add(args.result);
    } else {
        results.delete(args.result);
    }
    return [...results];
    })
);