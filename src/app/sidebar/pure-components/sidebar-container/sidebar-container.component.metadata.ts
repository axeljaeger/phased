import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

import { SidebarContainerComponent } from './sidebar-container.component';

import { MatInputModule } from '@angular/material/input';

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
    imports: [
      SidebarContainerComponent,
      MatExpansionModule,
      MatButtonToggleModule,
      MatFormFieldModule,
      MatIconModule,
      MatInputModule,
      MatListModule,
      ReactiveFormsModule,
    ],
    providers: [
      FormBuilder,
  ]
};