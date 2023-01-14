import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BabylonSceneDirective } from './directives/babylon-scene.directive';
import { TransducerBufferDirective } from './directives/transducer-buffer.directive';

import { ExcitationRendererComponent } from './renderers/excitation/excitation.component';
import { FarfieldRendererComponent } from './renderers/farfield/farfield-renderer.component';
import { RayleighIntegralRendererComponent } from './renderers/rayleigh-integral/rayleigh-renderer.component';
import { View3dComponent } from './smart-components/view3d/view3d.component';

import { LetModule } from '@ngrx/component';

@NgModule({
  declarations: [
    View3dComponent,
    ExcitationRendererComponent,
    RayleighIntegralRendererComponent,
    FarfieldRendererComponent,
    BabylonSceneDirective,
    TransducerBufferDirective
  ],
  imports: [
    CommonModule,
    LetModule
  ],
  exports: [
    View3dComponent
  ]
})
export class View3DModule { }
