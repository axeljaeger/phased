import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BabylonSceneDirective } from './directives/babylon-scene.directive';
import { TransducerBufferDirective } from './directives/transducer-buffer.directive';

import { ExcitationRendererComponent } from './renderers/excitation/excitation-renderer.component';
import { FarfieldRendererComponent } from './renderers/farfield/farfield-renderer.component';
import { RayleighIntegralRendererComponent } from './renderers/rayleigh-integral/rayleigh-renderer.component';
import { View3dComponent } from './smart-components/view3d/view3d.component';

import { LetDirective } from '@ngrx/component';

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
    LetDirective
  ],
  exports: [
    View3dComponent
  ]
})
export class View3DModule { }
