import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideMockStore } from '@ngrx/store/testing';

import { TransducerListComponent } from './transducer-list.component';

const initialState = {
  arrayConfig: { arrayType: 'ura', uraConfig: { elementsX: 2, elementsY: 2 } },
};

describe('TransducerListComponent', () => {
  let component: TransducerListComponent;
  let fixture: ComponentFixture<TransducerListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransducerListComponent],
      providers: [provideMockStore({ initialState })],
    }).compileComponents();

    fixture = TestBed.createComponent(TransducerListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
