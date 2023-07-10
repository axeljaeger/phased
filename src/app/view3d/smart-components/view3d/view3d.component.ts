import {
  ChangeDetectionStrategy,
  Component,
} from '@angular/core';

import { Store } from '@ngrx/store';

import { Results } from '../../../store';

import { setTransducerHovered } from '../../../store/actions/selection.actions';

import { selectTransducers } from '../../../store/selectors/arrayConfig.selector';
import { selectEnvironment } from '../../../store/selectors/environment.selector';
import { selectRayleigh } from '../../../store/selectors/rayleigh.selector';
import { selectSelection } from '../../../store/selectors/selection.selector';
import { selectResultEnabled } from '../../../store/selectors/viewportConfig.selector';
import { setPitchX } from '../../../store/actions/arrayConfig.actions';
import { RxState } from '@rx-angular/state';
import { FarfieldRendererComponent } from '../../renderers/farfield/farfield-renderer.component';
import { RayleighIntegralRendererComponent } from '../../renderers/rayleigh-integral/rayleigh-renderer.component';
import { NgIf, AsyncPipe } from '@angular/common';
import { TransducerBufferComponent } from '../../shared/transducer-buffer.component';
import { ExcitationRendererComponent } from '../../renderers/excitation/excitation-renderer.component';
import { BabylonJSViewComponent } from '../babylon-jsview/babylon-jsview.component';
import { RxLet } from '@rx-angular/template/let';


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
    ExcitationRendererComponent,
    TransducerBufferComponent,
    NgIf,
    RayleighIntegralRendererComponent,
    FarfieldRendererComponent,
    AsyncPipe,
  ],
})
export class View3dComponent {
  title = 'Air coupled Ultrasound Array';

  transducers$ = this.store.select(selectTransducers);
  selection$ = this.store.select(selectSelection);
  environment$ = this.store.select(selectEnvironment);

  vm$ = this.state.select();

  rayleighEnabled$ = this.store.select(
    selectResultEnabled(Results.RayleighIntegral)
  );
  rayleighAspect$ = this.store.select(selectRayleigh);

  farfieldEnabled$ = this.store.select(selectResultEnabled(Results.Farfield));

  constructor(
    private store: Store,
    private state: RxState<{
      transducers: any;
      environment: any;
      selection: any;
    }>
  ) {
    this.state.connect('transducers', this.store.select(selectTransducers));
    this.state.connect('environment', this.store.select(selectEnvironment));
    this.state.connect('selection', this.store.select(selectSelection));
  }

  public transducerHovered(transducerId: number): void {
    this.store.dispatch(setTransducerHovered({ transducerId }));
  }

  public setPitch(pitch: number): void {
    this.store.dispatch(setPitchX({ pitch }));
  }
}
