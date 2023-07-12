import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideMockStore } from '@ngrx/store/testing';

import { FarfieldComponent } from './farfield.component';

describe('FarfieldComponent', () => {
  let component: FarfieldComponent;
  let fixture: ComponentFixture<FarfieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        FarfieldComponent, NoopAnimationsModule,
      ],
      providers: [
        provideMockStore({})
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FarfieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
