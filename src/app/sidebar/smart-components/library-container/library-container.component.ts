import { Component, computed, effect, inject, input } from '@angular/core';
import { LibraryComponent } from '../../pure-components/library/library.component';
import { InfoComponent } from '../../pure-components/info/info.component';
import { StoreService } from 'src/app/store/store.service';
import { presets } from '../../../presets'

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
  public presets = presets;
  private store = inject(StoreService);
  public libraryIndex = input<number | null>();

  oldIindex = -1

  public loadPresetEffect = effect(() => {
    const index = this.libraryIndex();
    if (index === null || index === undefined || index === this.oldIindex) {
      return;
    }
    this.oldIindex = index;

    const preset = this.presets[index!];
    if (preset) {
      this.store.setConfig(preset);
    }
  });
  public citation = computed(() => this.store.arrayConfig().citation);
}
