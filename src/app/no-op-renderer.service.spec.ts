import { TestBed } from '@angular/core/testing';

import { NoOpRendererService } from './no-op-renderer.service';

describe('NoOpRendererService', () => {
  let service: NoOpRendererService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NoOpRendererService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
