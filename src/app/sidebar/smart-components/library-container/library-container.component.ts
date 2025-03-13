import { Component, inject } from '@angular/core';
import { LibraryComponent } from '../../pure-components/library/library.component';
import { Store } from '@ngrx/store';
import { ArrayConfig, ArrayConfigActions, arrayConfigFeature } from 'src/app/store/arrayConfig.state';
import { InfoComponent } from '../../pure-components/info/info.component';

@Component({
  selector: 'app-library-container',
  imports: [
    LibraryComponent,
    InfoComponent
  ],
  templateUrl: './library-container.component.html',
  styleUrl: './library-container.component.scss'
})
export class LibraryContainerComponent {
  private store = inject(Store);
  public array = this.store.selectSignal(arrayConfigFeature.selectArrayConfigState);

  loadPreset(preset: ArrayConfig) {
      this.store.dispatch(ArrayConfigActions.setConfig(preset));
  }
}
