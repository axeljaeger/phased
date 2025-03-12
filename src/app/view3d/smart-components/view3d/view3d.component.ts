import {
  ChangeDetectionStrategy,
  Component,
  inject,
} from '@angular/core';

import { Store } from '@ngrx/store';

import { FarfieldRendererComponent } from '../../renderers/farfield/farfield-renderer.component';
import { RayleighIntegralRendererComponent } from '../../renderers/rayleigh-integral/rayleigh-renderer.component';
import { TransducerBufferComponent } from '../../shared/transducer-buffer.component';
import { ExcitationRendererComponent } from '../../renderers/excitation/excitation-renderer.component';
import { BabylonJSViewComponent } from '../babylon-jsview/babylon-jsview.component';

import { BeamformingRendererComponent } from '../../renderers/beamforming/beamforming-renderer.component';
import { SelectionActions, selectionFeature } from 'src/app/store/selection.state';
import { Results, ViewportFeature } from 'src/app/store/viewportConfig.state';
import { RayleighFeature } from 'src/app/store/rayleigh.state';
import { BeamformingActions, beamformingFeature } from 'src/app/store/beamforming.state';
import { ArrayConfig, ArrayConfigActions, arrayConfigFeature } from 'src/app/store/arrayConfig.state';
import { ExportRendererComponent } from '../../renderers/export/export.component';
import { ExportActions, Result, ResultValues } from 'src/app/store/export.state';
import { UraInteractionRendererComponent } from '../../renderers/ura-interaction/ura-interaction-renderer.component';


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
  store = inject(Store);
  beamformingInteractive = this.store.selectSignal(beamformingFeature.selectInteractive);

  rayleighEnabled = this.store.selectSignal(
    ViewportFeature.selectResultEnabled(Results.RayleighIntegral)
  );
  rayleighAspect = this.store.selectSignal(RayleighFeature.selectAspect);
  rayleighResultSet = this.store.selectSignal(RayleighFeature.selectResultSet);
  farfieldEnabled = this.store.selectSignal(ViewportFeature.selectResultEnabled(Results.Farfield));
  k = this.store.selectSignal(arrayConfigFeature.selectK);
  ura = this.store.selectSignal(arrayConfigFeature.isUra);
  
  arrayConfig = this.store.selectSignal(arrayConfigFeature.selectArrayConfigState);
  transducers = this.store.selectSignal(arrayConfigFeature.selectTransducers);
  environment = this.store.selectSignal(arrayConfigFeature.selectEnvironment);
  selection =   this.store.selectSignal(selectionFeature.selectSelectionState);
  beamforming = this.store.selectSignal(beamformingFeature.selectBeamformingState);
  transducerDiameter = this.store.selectSignal(arrayConfigFeature.selectTransducerDiameter);
  
  public transducerHovered(transducerId: number): void {
    this.store.dispatch(SelectionActions.set({ transducerId }));
  }

  public setArrayConfig(arrayConfig: ArrayConfig): void {
    this.store.dispatch(ArrayConfigActions.setConfig(arrayConfig));
  }

  public setAz(az: number): void {
    this.store.dispatch(BeamformingActions.setU({ u: -Math.sin(az) }));
  }

  public setEl(el: number): void {
    this.store.dispatch(BeamformingActions.setV({ v: Math.sin(el) }));
  }

  onNewResults(results: ResultValues) {
    if (results) {
      this.store.dispatch(ExportActions.setResultValues(results));
    }
  }
}
