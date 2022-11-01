import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { NoopAnimationsModule  } from '@angular/platform-browser/animations';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule } from '@angular/forms';
import { LetModule } from '@ngrx/component'

import { SidebarContainerComponent } from './sidebar-container';

import { MatInputModule } from '@angular/material/input';
import { provideMockStore } from '@ngrx/store/testing';
import { FormBuilder } from '@angular/forms';

export const initialState = {
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

export const moduleMetaData = {
    declarations: [ SidebarContainerComponent ],
    imports: [
      MatExpansionModule,
      MatButtonToggleModule,
      MatFormFieldModule,
      MatIconModule,
      MatInputModule,
      MatListModule,
      NoopAnimationsModule,
      ReactiveFormsModule,
      LetModule
    ],
    providers: [
      FormBuilder,
      provideMockStore({ initialState }),  
  ]
};