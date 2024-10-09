import { Component, ElementRef, OnInit, ViewChild, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import Chart from 'chart.js/auto';
import { exportFeature } from 'src/app/store/export.state';
import {MatButtonModule} from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';

@Component({
  selector: 'app-chart',
  standalone: true,
  imports: [MatButtonModule, MatExpansionModule],
  templateUrl: './chart.component.html',
  styleUrl: './chart.component.scss'
})
export class ChartComponent implements OnInit {
  private readonly store = inject(Store);
  @ViewChild('chartCanvas', { static: true })
  canvasRef: ElementRef<HTMLCanvasElement>;
  
  ngOnInit(): void {
    const data = {
      datasets: [{
        label: 'u',
        data: [{
          x: -10,
          y: 0
        }],
        fill: false,
        showLine: true,
        pointStyle: false as any as string,
        borderWidth: 1,
        borderColor: 'red',
      }, {
        label: 'v',
        data: [{
          x: -10,
          y: 0
        }],
        fill: false,
        showLine: true,
        pointStyle: false as any as string,
        borderWidth: 1,
        borderColor: 'green',
      }
      ],
    };

    const chart = new Chart(this.canvasRef.nativeElement, {
      type: 'scatter',
      data: data,
      options: {
        scales: {
          x: {
            type: 'linear',
            position: 'bottom',
            min: -1,
            max: 1,

          },
          y: {
            type: 'linear',
            position: 'left',
            min: 0,
            max: 1,
          },
        },
        animation: false,
      } 
    });

    this.store.select(exportFeature.selectExportState).subscribe(state => {
      chart.data.datasets[0].data = state?.u;
      chart.data.datasets[1].data = state?.v;
      chart.update();
    });
  }

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
