import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SidebarContainerComponent } from './pure-components/sidebar-container/sidebar-container';
import { RayleighComponent } from './smart-components/rayleigh/rayleigh.component';
import { FarfieldComponent } from './smart-components/farfield/farfield.component';
import { TransducerListComponent } from './smart-components/transducer-list/transducer-list.component';
import { ArrayConfigComponent } from './smart-components/array-config/array-config.component';

import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ReactiveFormsModule } from '@angular/forms';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatRadioModule } from '@angular/material/radio';

import { LetModule } from '@ngrx/component';

@NgModule({
  declarations: [
    RayleighComponent,
    FarfieldComponent,
    TransducerListComponent,
    ArrayConfigComponent,
    SidebarContainerComponent
  ],
  imports: [
    CommonModule,
    LetModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatRadioModule,
    MatButtonToggleModule,
    MatCheckboxModule,
    ReactiveFormsModule,
  ],
  exports: [
    SidebarContainerComponent
  ]
})
export class SidebarModule { }
