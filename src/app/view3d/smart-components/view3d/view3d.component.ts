import {
  ChangeDetectionStrategy,
  Component,
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
import { rayleighFeature } from 'src/app/store/rayleigh.state';
import { environmentFeature } from 'src/app/store/environment.state';
import { BeamformingActions, beamformingFeature } from 'src/app/store/beamforming.state';
import { ArrayConfigActions, arrayConfigFeature } from 'src/app/store/arrayConfig.state';
import { map } from 'rxjs';
import { Vector2 } from '@babylonjs/core';


@Component({
  selector: 'app-view3d',
  templateUrl: './view3d.component.html',
  styleUrls: ['./view3d.component.css'],
  providers: [RxState],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    RxLet,
    BabylonJSViewComponent,
    BeamformingRendererComponent,
    ExcitationRendererComponent,
    TransducerBufferComponent,
    RayleighIntegralRendererComponent,
    FarfieldRendererComponent,
    AsyncPipe
],
})
export class View3dComponent {
  title = 'Air coupled Ultrasound Array';
  vm$ = this.state.select();

  rayleighEnabled$ = this.store.select(
    ViewportFeature.selectResultEnabled(Results.RayleighIntegral)
  );
  rayleighAspect$ = this.store.select(rayleighFeature.selectRayleighState);
  farfieldEnabled$ = this.store.select(ViewportFeature.selectResultEnabled(Results.Farfield));
  k$ = this.store.select(environmentFeature.selectEnvironmentState).pipe(map((c) => 2 * Math.PI * 40000 / c ));

  constructor(
    private store: Store,
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

  public setPitchX(pitch: number): void {
    this.store.dispatch(ArrayConfigActions.setPitchX({ pitch }));
  }

  public setScale(scale: Vector2): void {
    this.store.dispatch(ArrayConfigActions.scaleArray({scale}));
  }

  public setPitchY(pitch: number): void {
    this.store.dispatch(ArrayConfigActions.setPitchY({ pitch }));
  }

  public setAz(az: number) : void {
    this.store.dispatch(BeamformingActions.setU({u: -Math.sin(az)}));
  }

  public setEl(el: number) : void {
    this.store.dispatch(BeamformingActions.setV({v: Math.sin(el)}));
  }
}
