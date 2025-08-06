import { Component, computed, DestroyRef, inject, model } from '@angular/core';

import { FormsModule } from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';

import { StoreService } from 'src/app/store/store.service';

@Component({
  selector: 'app-export',
  imports: [
    MatIcon,
    MatIconButton,
    MatCardModule,
    MatCheckbox,
    FormsModule
  ],
  templateUrl: './export.component.html',
  styleUrl: './export.component.scss'
})
export class ExportComponent {
  private store = inject(StoreService);
  private destroyRef = inject(DestroyRef);
  
  formatToLocale = model(false);

  private transducerPositions = computed(() => this.store.transducers().reduce((acc, t) => 
  {
    const localize = this.formatToLocale();
    const values = [
      t.pos.x,
      t.pos.y
    ].map(value => localize ? value.toLocaleString('de-DE') : value.toString());
    const [x, y] = values;
    return acc + `${x}\t${y}\n`;
  }, `# Array configuration exported from: x;y\n` ));

  private chartsString = computed(() => this.store.crossPattern().reduce((acc, line) => {
    const localize = this.formatToLocale();
    const values = [
      line.angle,
      line.az,
      line.el
    ].map(value => localize ? value.toLocaleString('de-DE') : value.toString());
    const [angle, az, el] = values;
    return acc + `${angle}\t${az}\t${el}\n`;
  }, `# Chart exported from: angle;az;el\n`));

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
