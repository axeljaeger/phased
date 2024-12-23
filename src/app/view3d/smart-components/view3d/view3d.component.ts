import {
  ChangeDetectionStrategy,
  Component,
  inject,
} from '@angular/core';

import { Store } from '@ngrx/store';

import { RxState } from '@rx-angular/state';
import { FarfieldRendererComponent } from '../../renderers/farfield/farfield-renderer.component';
import { RayleighIntegralRendererComponent } from '../../renderers/rayleigh-integral/rayleigh-renderer.component';
import { AsyncPipe } from '@angular/common';
import { TransducerBufferComponent } from '../../shared/transducer-buffer.component';
import { ExcitationRendererComponent } from '../../renderers/excitation/excitation-renderer.component';
import { BabylonJSViewComponent } from '../babylon-jsview/babylon-jsview.component';
import { RxLet } from '@rx-angular/template/let';

import { BeamformingRendererComponent } from '../../renderers/beamforming/beamforming-renderer.component';
import { SelectionActions, selectionFeature } from 'src/app/store/selection.state';
import { Results, ViewportFeature } from 'src/app/store/viewportConfig.state';
import { RayleighFeature } from 'src/app/store/rayleigh.state';
import { environmentFeature } from 'src/app/store/environment.state';
import { BeamformingActions, beamformingFeature } from 'src/app/store/beamforming.state';
import { ArrayConfig, ArrayConfigActions, arrayConfigFeature } from 'src/app/store/arrayConfig.state';
import { ExportRendererComponent } from '../../renderers/export/export.component';
import { ExportActions, Result } from 'src/app/store/export.state';
import { UraInteractionRendererComponent } from '../../renderers/ura-interaction/ura-interaction-renderer.component';


@Component({
    selector: 'app-view3d',
    templateUrl: './view3d.component.html',
    styleUrls: ['./view3d.component.scss'],
    providers: [RxState],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        RxLet,
        BabylonJSViewComponent,
        BeamformingRendererComponent,
        ExcitationRendererComponent,
        ExportRendererComponent,
        TransducerBufferComponent,
        RayleighIntegralRendererComponent,
        FarfieldRendererComponent,
        AsyncPipe,
        UraInteractionRendererComponent
    ]
})
export class View3dComponent {
  store = inject(Store);
  beamformingInteractive$ = this.store.select(beamformingFeature.selectInteractive);
  title = 'Air coupled Ultrasound Array';
  vm$ = this.state.select();

  rayleighEnabled$ = this.store.select(
    ViewportFeature.selectResultEnabled(Results.RayleighIntegral)
  );
  rayleighAspect$ = this.store.select(RayleighFeature.selectAspect);
  rayleighResultSet$ = this.store.select(RayleighFeature.selectResultSet);
  farfieldEnabled$ = this.store.select(ViewportFeature.selectResultEnabled(Results.Farfield));
  k$ = this.store.select(environmentFeature.selectK);
  ura$ = this.store.select(arrayConfigFeature.isUra);
  arrayConfig$ = this.store.select(arrayConfigFeature.selectArrayConfigState);
  constructor(
    private state: RxState<{
      transducers: any;
      environment: any;
      selection: any;
      beamforming: any;
    }>
  ) {
    this.state.connect('transducers', this.store.select(arrayConfigFeature.selectTransducers));
    this.state.connect('environment', this.store.select(environmentFeature.selectEnvironmentState));
    this.state.connect('selection', this.store.select(selectionFeature.selectSelectionState));
    this.state.connect('beamforming', this.store.select(beamformingFeature.selectBeamformingState));
  }

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

  onNewResults(results: Result) {
    if (results) {
      this.store.dispatch(ExportActions.setResults(results));
    }
  }
}
