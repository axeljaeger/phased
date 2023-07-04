import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ExcitationRendererComponent } from './renderers/excitation/excitation-renderer.component';
import { FarfieldRendererComponent } from './renderers/farfield/farfield-renderer.component';
import { RayleighIntegralRendererComponent } from './renderers/rayleigh-integral/rayleigh-renderer.component';
import { View3dComponent } from './smart-components/view3d/view3d.component';

import { RxLet } from '@rx-angular/template/let';
import { BabylonJSViewComponent } from './smart-components/babylon-jsview/babylon-jsview.component';
import { TransducerBufferComponent } from './shared/transducer-buffer.component';

@NgModule({
  declarations: [
    View3dComponent,
    ExcitationRendererComponent,
    RayleighIntegralRendererComponent,
    FarfieldRendererComponent,
    BabylonJSViewComponent,
    TransducerBufferComponent
  ],
  imports: [
    CommonModule,
    RxLet
  ],
  exports: [
    View3dComponent
  ]
})
export class View3DModule { }
