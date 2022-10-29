import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FarfieldComponent } from './farfield.component';

describe('FarfieldComponent', () => {
  let component: FarfieldComponent;
  let fixture: ComponentFixture<FarfieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FarfieldComponent ]
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
