import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable } from 'rxjs';

import { FarfieldRendererEffects } from './farfield-renderer.effects';

describe('FarfieldRendererEffects', () => {
  let actions$: Observable<any>;
  let effects: FarfieldRendererEffects;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        FarfieldRendererEffects,
        provideMockActions(() => actions$)
      ]
    });

    effects = TestBed.inject(FarfieldRendererEffects);
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });
});
