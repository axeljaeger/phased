import { Component, output, inject, AfterViewInit, DestroyRef } from '@angular/core';

import { presets } from '../../../presets'
import { MatSelectionList, MatListItem, MatListItemTitle, MatListItemIcon, MatListItemLine } from '@angular/material/list';
import { MatIcon } from '@angular/material/icon';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ArrayConfig } from 'src/app/store/store.service';

@Component({
  selector: 'app-library',
  imports: [MatSelectionList, MatListItem, MatIcon, MatListItemTitle, MatListItemIcon, MatListItemLine, RouterLink],
  templateUrl: './library.component.html',
  styleUrl: './library.component.scss'
})
export class LibraryComponent implements AfterViewInit {
  destroyRef = inject(DestroyRef);
  presets = presets;
  loadPreset = output<ArrayConfig>();
  
  private route = inject(ActivatedRoute);
  // FIXME: This should not be necessary due to router withComponentInputBinding
  index$ = this.route.paramMap.pipe(map(params => params.get('libraryIndex')));

  ngAfterViewInit(): void {
    this.index$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(index => {
      if (index !== null && index !== undefined) {
        this.loadPreset.emit(this.presets[+index]);
      }
  });
  }
}
