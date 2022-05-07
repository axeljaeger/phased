import { createReducer, on } from '@ngrx/store';
import { setConfig } from '../actions/arrayConfig.actions';

export interface ArrayConfig {
    arrayType: string;
    uraConfig: {
        elementsX: number;
        elementsY: number;
        pitchX: number;
        pitchY: number;
    },
    circularConfig: {
        radius: number;
        elements: number;
    } 
}

export const initialState : ArrayConfig = {
    arrayType: 'ura',
    uraConfig: {
        elementsX: 2,
        elementsY: 2,
        pitchX: 0.0043,
        pitchY: 0.0043
    },
    circularConfig: {
        radius: 2,
        elements: 2,
    }
};

export const arrayConfigReducer = createReducer(
  initialState,
  on(setConfig, (state: ArrayConfig, newConfig) : ArrayConfig => {
      return {
        ...newConfig
      }
    })
);