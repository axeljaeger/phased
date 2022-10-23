import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable } from 'rxjs';

import { RayleighRendererEffects } from './rayleigh-renderer.effects';

describe('RayleighRendererEffects', () => {
  let actions$: Observable<any>;
  let effects: RayleighRendererEffects;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        RayleighRendererEffects,
        provideMockActions(() => actions$)
      ]
    });

    effects = TestBed.inject(RayleighRendererEffects);
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });
});
