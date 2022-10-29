import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransducerListComponent } from './transducer-list.component';

describe('TransducerListComponent', () => {
  let component: TransducerListComponent;
  let fixture: ComponentFixture<TransducerListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TransducerListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TransducerListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
