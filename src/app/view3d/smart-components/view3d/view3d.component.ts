import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';

import { FarfieldRendererComponent } from '../../renderers/farfield/farfield-renderer.component';
import { RayleighIntegralRendererComponent } from '../../renderers/rayleigh-integral/rayleigh-renderer.component';
import { TransducerBufferComponent } from '../../shared/transducer-buffer.component';
import { ExcitationRendererComponent } from '../../renderers/excitation/excitation-renderer.component';
import { BabylonJSViewComponent } from '../babylon-jsview/babylon-jsview.component';

import { BeamformingRendererComponent } from '../../renderers/beamforming/beamforming-renderer.component';
import { Results } from 'src/app/store/viewportConfig.state';
import { ExportRendererComponent } from '../../renderers/export/export.component';
import { ResultValues } from 'src/app/store/export.state';
import { UraInteractionRendererComponent } from '../../renderers/ura-interaction/ura-interaction-renderer.component';
import { ArrayConfig, StoreService } from 'src/app/store/store.service';


@Component({
    selector: 'app-view3d',
    templateUrl: './view3d.component.html',
    styleUrls: ['./view3d.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        BabylonJSViewComponent,
        BeamformingRendererComponent,
        ExcitationRendererComponent,
        ExportRendererComponent,
        TransducerBufferComponent,
        RayleighIntegralRendererComponent,
        FarfieldRendererComponent,
        UraInteractionRendererComponent
    ]
})
export class View3dComponent {
  store = inject(StoreService);
  beamformingInteractive = computed(() => this.store.beamforming().interactive);

  rayleighEnabled = computed(() => this.store.enabledResults().includes(Results.RayleighIntegral));

  rayleighAspect = this.store.aspect;
  rayleighResultSet = this.store.resultSet;
  farfieldEnabled = computed(() => this.store.enabledResults().includes(Results.Farfield));
  k = this.store.k;
  ura = computed(() => this.store.arrayConfig().config.type === 'ura');
  
  transducers = this.store.transducers;
  
  arrayConfig = this.store.arrayConfig;
  
  selection =   this.store.selection;
  beamforming = this.store.beamforming;
  
  public transducerHovered(transducerId: number): void {
    this.store.setHovered(transducerId);
  }

  public setArrayConfig(arrayConfig: ArrayConfig): void {
    this.store.setConfig(arrayConfig);
  }

  public setAz(az: number): void {
    this.store.setU(-Math.sin(az));
  }

  public setEl(el: number): void {
    this.store.setV(Math.sin(el));
  }

  onNewResults(results: ResultValues) {
    if (results) {
      this.store.setResultValues(results);
    }
  }
}
