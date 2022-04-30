import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EngineService } from '../engine.service';

import { View3dComponent } from './view3d.component';

describe('View3dComponent', () => {
  let component: View3dComponent;
  let fixture: ComponentFixture<View3dComponent>;

  const engineServiceMock = {
    initEngine: jest.fn(),
    start: jest.fn()
  };


  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ View3dComponent ],
      providers: [
        { provide: EngineService, useValue: engineServiceMock }
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(View3dComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
