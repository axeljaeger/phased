import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StorybookTestbedComponent } from './storybook-testbed.component';

describe('StorybookTestbedComponent', () => {
  let component: StorybookTestbedComponent;
  let fixture: ComponentFixture<StorybookTestbedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StorybookTestbedComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StorybookTestbedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
