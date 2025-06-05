import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { FarfieldComponent } from './farfield.component';

describe('FarfieldComponent', () => {
  let component: FarfieldComponent;
  let fixture: ComponentFixture<FarfieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        FarfieldComponent, NoopAnimationsModule,
      ],
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
