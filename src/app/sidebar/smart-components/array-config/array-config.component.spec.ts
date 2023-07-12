import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideMockStore } from '@ngrx/store/testing';

import { ArrayConfigComponent } from './array-config.component';

describe('ArrayConfigComponent', () => {
  let component: ArrayConfigComponent;
  let fixture: ComponentFixture<ArrayConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ ArrayConfigComponent, NoopAnimationsModule ],
      providers: [
        provideMockStore({})
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ArrayConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
