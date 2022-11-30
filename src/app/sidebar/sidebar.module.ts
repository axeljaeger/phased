import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SidebarContainerComponent } from './pure-components/sidebar-container/sidebar-container';
import { RayleighComponent } from './smart-components/rayleigh/rayleigh.component';
import { FarfieldComponent } from './smart-components/farfield/farfield.component';
import { TransducerListComponent } from './smart-components/transducer-list/transducer-list.component';
import { ArrayConfigComponent } from './smart-components/array-config/array-config.component';

import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
import { ReactiveFormsModule } from '@angular/forms';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyListModule as MatListModule } from '@angular/material/legacy-list';
import { MatLegacyRadioModule as MatRadioModule } from '@angular/material/legacy-radio';

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
