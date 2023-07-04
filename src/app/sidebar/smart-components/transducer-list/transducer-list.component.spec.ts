import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LetModule, LetDirective } from '@ngrx/component';
import { provideMockStore } from '@ngrx/store/testing';
import { SidebarModule } from '../../sidebar.module';

import { TransducerListComponent } from './transducer-list.component';

describe('TransducerListComponent', () => {
  let component: TransducerListComponent;
  let fixture: ComponentFixture<TransducerListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TransducerListComponent ],
      imports: [ LetModule, SidebarModule ],
      providers: [
        provideMockStore({})
      ]
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
