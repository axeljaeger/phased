import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { Observable } from 'rxjs';

import { RayleighRendererEffects } from './rayleigh-renderer.effects';

describe('RayleighRendererEffects', () => {
  let actions$: Observable<any>;
  let effects: RayleighRendererEffects;
  let initialState = {};
  let store: MockStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        RayleighRendererEffects,
        provideMockActions(() => actions$),
        provideMockStore({ initialState }),
      ]
    });
    store = TestBed.inject(MockStore);

    effects = TestBed.inject(RayleighRendererEffects);
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });
});
