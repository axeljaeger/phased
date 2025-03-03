import { Component, inject } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { Store } from '@ngrx/store';

import { exportFeature } from 'src/app/store/export.state';


@Component({
  selector: 'app-export',
  imports: [
    MatIcon,
    MatIconButton,
    MatCardModule,
  ],
  templateUrl: './export.component.html',
  styleUrl: './export.component.scss'
})
export class ExportComponent {
      private store = inject(Store);
  
  download() : void {
    this.store.select(exportFeature.selectExportState).subscribe(state => {
      const content = state.u.map((u, index) => `${u.x.toLocaleString()}; ${u.y.toLocaleString()};${state.v[index].y.toLocaleString()}`).join('\n');
      const a = document.createElement('a') // Create "a" element
      const blob = new Blob([content], {type: 'text/csv'}) // Create a blob (file-like object)
      const url = URL.createObjectURL(blob) // Create an object URL from blob
      a.setAttribute('href', url) // Set "a" element link
      a.setAttribute('download', 'response.csv') // Set download filename
      a.click() // Start downloading
    });
  }
}
