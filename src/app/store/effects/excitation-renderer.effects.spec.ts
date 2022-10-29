import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { Observable } from 'rxjs';

import { ExcitationRendererEffects } from './excitation-renderer.effects';

describe('ExcitationRendererEffects', () => {
  let actions$: Observable<any>;
  let effects: ExcitationRendererEffects;
  let initialState = {};
  let store: MockStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ExcitationRendererEffects,
        provideMockActions(() => actions$),
        provideMockStore({ initialState }),
      ]
    });
    store = TestBed.inject(MockStore);

    effects = TestBed.inject(ExcitationRendererEffects);
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });
});
