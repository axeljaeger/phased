import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { provideMockStore, MockStore } from '@ngrx/store/testing';

import { Observable } from 'rxjs';


describe('FarfieldRendererEffects', () => {
  let actions$: Observable<any>;
  let initialState = {};
  let store: MockStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideMockActions(() => actions$),
        provideMockStore({ initialState }),
      ]
    });
    store = TestBed.inject(MockStore);

  });

  it('should be created', () => {
    


  });
});
