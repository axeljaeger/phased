import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { Observable } from 'rxjs';

import { describe, beforeEach, it, expect } from 'vitest';


describe('FarfieldRendererEffects', () => {
  let actions$: Observable<any>;
  let initialState = {};

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
      ]
    });
  });

  it('should be created', () => {
    


  });
});
