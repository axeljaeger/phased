import { Component, computed, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { MatCardModule } from '@angular/material/card';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

import { StoreService } from 'src/app/store/store.service';

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
  private store = inject(StoreService);
  private destroyRef = inject(DestroyRef);
  
  private transducerPositions = computed(() => this.store.transducers().reduce((acc, t) => 
    acc + `${t.pos.x.toLocaleString('de-DE')}\t${t.pos.y.toLocaleString('de-DE')}\n`, 
`# Array configuration exported from: x;y\n` ));
  
  private chartsString = computed(() => this.store.samplePatternU().reduce((acc, line) =>
      acc + `${line.x.toLocaleString('de-DE')}\t${line.y.toLocaleString('de-DE')}\n`,
`# Chart exported from: x;y\n`
));


  download() : void {
    const u = this.store.u();
    const v = this.store.v();
    const content = u.map((u, index) => `${u.x.toLocaleString()}; ${u.y.toLocaleString()};${v[index].y.toLocaleString()}`).join('\n');
    const a = document.createElement('a') // Create "a" element
    const blob = new Blob([content], {type: 'text/csv'}) // Create a blob (file-like object)
    const url = URL.createObjectURL(blob) // Create an object URL from blob
    a.setAttribute('href', url) // Set "a" element link
    a.setAttribute('download', 'response.csv') // Set download filename
    a.click() // Start downloading
  }

  copyTransducerPositions() {
    navigator.clipboard.writeText(this.transducerPositions())
  }
    
  copyCharts() {
    navigator.clipboard.writeText(this.chartsString());
  }
}
