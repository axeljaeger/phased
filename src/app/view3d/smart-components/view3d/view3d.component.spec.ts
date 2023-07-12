import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideMockStore } from '@ngrx/store/testing';

import { View3dComponent } from './view3d.component';

describe('View3dComponent', () => {
  let component: View3dComponent;
  let fixture: ComponentFixture<View3dComponent>;

  const mockData = {
    arrayConfig: {
      arrayType: 'URA',
    }
  }


  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ View3dComponent ],
      providers: [
        provideMockStore({ initialState: mockData})
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
