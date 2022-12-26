import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { Results } from './store';
import { setTransducerHovered } from './store/actions/selection.actions';
import { selectTransducers } from './store/selectors/arrayConfig.selector';
import { selectEnvironment } from './store/selectors/environment.selector';
import { selectRayleigh } from './store/selectors/rayleigh.selector';
import { selectSelection } from './store/selectors/selection.selector';
import { selectResultEnabled } from './store/selectors/viewportConfig.selector';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Air coupled Ultrasound Array';

  transducers$ = this.store.select(selectTransducers);
  selection$ = this.store.select(selectSelection);
  environment$ = this.store.select(selectEnvironment);

  rayleighEnabled$ = this.store.select(selectResultEnabled(Results.RayleighIntegral));
  rayleighAspect$ = this.store.select(selectRayleigh);

  constructor(private store: Store) {}

  public setHovered(transducerId : number) : void {
    this.store.dispatch(setTransducerHovered({transducerId }));
  }

}
