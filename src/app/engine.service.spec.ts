import { TestBed } from '@angular/core/testing';

import { provideMockStore, MockStore } from '@ngrx/store/testing';

import { EngineService } from './engine.service';

describe('EngineService', () => {
  let service: EngineService;
  let store: MockStore;
  let initialState = {};

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideMockStore({ initialState }),
      ]
    });
    store = TestBed.inject(MockStore);
    service = TestBed.inject(EngineService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
