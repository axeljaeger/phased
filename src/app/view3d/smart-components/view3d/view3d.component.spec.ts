import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LetModule, LetDirective } from '@ngrx/component';
import { provideMockStore } from '@ngrx/store/testing';

import { View3dComponent } from './view3d.component';

import { TransducerBufferDirective } from '../../directives/transducer-buffer.directive';
import { View3DModule } from '../../view3d.module';

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
      declarations: [ View3dComponent, TransducerBufferDirective ],
      imports: [ LetModule, View3DModule],
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
