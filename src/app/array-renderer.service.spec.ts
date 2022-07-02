import { TestBed } from '@angular/core/testing';

import { ArrayRendererService } from './array-renderer.service';

describe('ArrayRendererService', () => {
  let service: ArrayRendererService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ArrayRendererService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
