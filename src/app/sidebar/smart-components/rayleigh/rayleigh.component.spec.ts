import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { RayleighComponent } from './rayleigh.component';

describe('RayleighComponent', () => {
  let component: RayleighComponent;
  let fixture: ComponentFixture<RayleighComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ NoopAnimationsModule, RayleighComponent ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(RayleighComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
