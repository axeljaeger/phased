import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { MatCardModule } from '@angular/material/card';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

import { Store } from '@ngrx/store';

import { exportFeature } from 'src/app/store/export.state';
import { arrayConfigFeature } from 'src/app/store/arrayConfig.state';
import { map } from 'rxjs';


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
  private destroyRef = inject(DestroyRef);
  
  private transducerPositions = this.store.select(arrayConfigFeature.selectTransducers).pipe(map(transducers => transducers.reduce((acc, t) => 
    acc + `${t.pos.x.toLocaleString('de-DE')}\t${t.pos.y.toLocaleString('de-DE')}\n`, 
`# Array configuration exported from: x;y\n`
  )));

  private chartsString = this.store.select(arrayConfigFeature.samplePatternU).pipe(map(charts => charts.reduce((acc, line) =>
      acc + `${line.x.toLocaleString('de-DE')}\t${line.y.toLocaleString('de-DE')}\n`,
`# Chart exported from: x;y\n`
)));


  download() : void {
    this.store.select(exportFeature.selectExportState).pipe(takeUntilDestroyed()).subscribe(state => {
      const content = state.u.map((u, index) => `${u.x.toLocaleString()}; ${u.y.toLocaleString()};${state.v[index].y.toLocaleString()}`).join('\n');
      const a = document.createElement('a') // Create "a" element
      const blob = new Blob([content], {type: 'text/csv'}) // Create a blob (file-like object)
      const url = URL.createObjectURL(blob) // Create an object URL from blob
      a.setAttribute('href', url) // Set "a" element link
      a.setAttribute('download', 'response.csv') // Set download filename
      a.click() // Start downloading
    });
  }

  copyTransducerPositions() {
    this.transducerPositions.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(transducerString => 
      navigator.clipboard.writeText(transducerString)
    );
  }
    
  copyCharts() {
    this.chartsString.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(chartsString => navigator.clipboard.writeText(chartsString));
  }
}
