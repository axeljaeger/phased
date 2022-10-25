import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { provideMockStore, MockStore } from '@ngrx/store/testing';

import { Observable } from 'rxjs';

import { FarfieldRendererEffects } from './farfield-renderer.effects';

describe('FarfieldRendererEffects', () => {
  let actions$: Observable<any>;
  let effects: FarfieldRendererEffects;
  let initialState = {};
  let store: MockStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        FarfieldRendererEffects,
        provideMockActions(() => actions$),
        provideMockStore({ initialState }),
      ]
    });
    store = TestBed.inject(MockStore);

    effects = TestBed.inject(FarfieldRendererEffects);
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });
});
