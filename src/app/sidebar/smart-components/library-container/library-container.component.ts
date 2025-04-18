import { Component, computed, inject } from '@angular/core';
import { LibraryComponent } from '../../pure-components/library/library.component';
import { InfoComponent } from '../../pure-components/info/info.component';
import { ArrayConfig, StoreService } from 'src/app/store/store.service';

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
  private store = inject(StoreService);
  public array = computed(() =>this.store.arrayConfig().config);
  public citation = computed(() => this.store.arrayConfig().citation);

  loadPreset(preset: ArrayConfig) {
      this.store.setConfig(preset);
  }
}
