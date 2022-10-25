import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable } from 'rxjs';

import { ExcitationRendererEffects } from './excitation-renderer.effects';

describe('ExcitationRendererEffects', () => {
  let actions$: Observable<any>;
  let effects: ExcitationRendererEffects;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ExcitationRendererEffects,
        provideMockActions(() => actions$)
      ]
    });

    effects = TestBed.inject(ExcitationRendererEffects);
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });
});
