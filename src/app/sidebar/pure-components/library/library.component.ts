import { Component, output } from '@angular/core';

import { presets } from '../../../presets'
import { MatSelectionList, MatListItem, MatListItemTitle, MatListItemIcon, MatListItemLine } from '@angular/material/list';
import { MatIcon } from '@angular/material/icon';
import { ArrayConfig } from 'src/app/store/arrayConfig.state';
import { EnvironmentState } from 'src/app/store/environment.state';

@Component({
  selector: 'app-library',
  imports: [MatSelectionList, MatListItem, MatIcon, MatListItemTitle, MatListItemIcon, MatListItemLine],
  templateUrl: './library.component.html',
  styleUrl: './library.component.scss'
})
export class LibraryComponent {
  presets = presets;
  loadPreset = output<{config: ArrayConfig, environment: EnvironmentState}>();

  loadPresetIndex(index: number) {
    this.loadPreset.emit(this.presets[index]);
  }
}
