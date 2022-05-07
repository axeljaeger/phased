import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { ReactiveComponentModule } from '@ngrx/component'

import { FormBuilder } from '@angular/forms';

import { MenuLeftComponent } from './menu-left.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { NoopAnimationsModule  } from '@angular/platform-browser/animations';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';


describe('MenuLeftComponent', () => {
  let component: MenuLeftComponent;
  let fixture: ComponentFixture<MenuLeftComponent>;

  const initialState = {
    arrayConfig: {
      arrayType: 'ura',
      uraConfig: {
        elementsX: 2,
        elementsY: 2,
        pitchX: 0.0043,
        pitchY: 0.0043
      },
      circularConfig: {
        radius: 2,
        elements: 2,
      }
    }
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MenuLeftComponent ],
      imports: [
        MatExpansionModule,
        MatButtonToggleModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatListModule,
        NoopAnimationsModule,
        ReactiveFormsModule,
        ReactiveComponentModule
      ],
      providers: [
        { provide: FormBuilder, useClass: FormBuilder},
        provideMockStore({ initialState }),

      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MenuLeftComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
