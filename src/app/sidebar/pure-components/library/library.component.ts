import { Component, input } from '@angular/core';

import { MatSelectionList, MatListItem, MatListItemTitle, MatListItemIcon, MatListItemLine } from '@angular/material/list';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { ArrayConfig } from 'src/app/store/store.service';

@Component({
  selector: 'app-library',
  imports: [MatSelectionList, MatListItem, MatIcon, MatListItemTitle, MatListItemIcon, MatListItemLine, RouterLink],
  templateUrl: './library.component.html',
  styleUrl: './library.component.scss'
})
export class LibraryComponent {
  presets = input<ArrayConfig[]>([]);
}
