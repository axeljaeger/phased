import { Component, DestroyRef, ElementRef, OnInit, ViewChild, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { createSelector, Store } from '@ngrx/store';
import { exportFeature, ResultSpace } from 'src/app/store/export.state';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';

import * as echarts from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';

import { LineChart } from 'echarts/charts';


// Import the title, tooltip, rectangular coordinate system, dataset and transform components
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent,
  LegendComponent,
  MarkAreaComponent,
  MarkLineComponent
} from 'echarts/components';
import { ECBasicOption } from 'echarts/types/dist/shared';
import { arrayConfigFeature } from 'src/app/store/arrayConfig.state';

const seriesTemplate = {
name: 'u',
type: 'line',
showSymbol: false,
lineStyle: {
  color: 'rgba(192, 0, 0, 0.8)',
},
data: [], // Data series
markLine: {
  symbol: ['none', 'none'],
  label: { show: false },
  data: [{ yAxis: 0.1 }]
},
markArea: {
  itemStyle: {
    color: 'rgba(255, 0, 0, 0.1)'
  },
  label: {
    position: ['100%', '20%']
  },
  data: [
 // xAxis + yAxis für Bereich                       
    ]
  }
}

@Component({
    selector: 'app-chart',
    imports: [
      MatButtonModule,
      MatExpansionModule
    ],
    templateUrl: './chart.component.html',
    styleUrl: './chart.component.scss'
})
export class ChartComponent implements OnInit {
  private readonly store = inject(Store);
  destroyRef = inject(DestroyRef);

  @ViewChild('echartDiv', { static: true })
  echartDiv: ElementRef<HTMLElement>;

  transducers = this.store.selectSignal(arrayConfigFeature.selectTransducers);

  ngOnInit(): void {
    

// Register the required components
    echarts.use([
      TitleComponent,
      TooltipComponent,
      GridComponent,
      DatasetComponent,
      TransformComponent,
      CanvasRenderer,
      LegendComponent,
      LineChart,
      MarkAreaComponent,
      MarkLineComponent
    ]);


    const myChart = echarts.init(this.echartDiv.nativeElement);

    const option : ECBasicOption = {
      tooltip: {
        trigger: 'item',
        formatter: (params : any) => `${params.seriesName} <br> ${params.name} : ${params.value.toFixed(2)}`
      },
      // legend: {
      //   left: 'left'
      // },
      grid: [{
        top: '7%',
        left: '3%',
        right: '3%',
        height: '40%',
        containLabel: true
      },
      {
        left: '3%',
        right: '3%',
        top: '55%',
        height: '45%',
        containLabel: true
      }
    ],

    xAxis: [{
      name: 'x',
      type: 'value',
      axisLabel: {
          inside: false,
          align: 'center',
          verticalAlign: 'middle',
          padding: [10, 10, 10, 10], // Optional für Feinanpassung
          color: '#e6e1e6',
          formatter: (value : number) => `${value.toFixed(0)}°`,
      },
      splitLine: {
        show: true,
        lineStyle: {
            color: '#444444', // Grün für Y-Achse
            width: 1,
            type: 'solid'
        }
      }
    },
    {
      gridIndex: 1,
      name: 'x2',
      type: 'value',
      axisLabel: {
          inside: false,
          align: 'center',
          verticalAlign: 'middle',
          padding: [0, 0, 0, 0], // Optional für Feinanpassung
          color: '#e6e1e6'
      },
      splitLine: {
        show: true,
        lineStyle: {
            color: '#444444', // Grün für Y-Achse
            width: 1,
            type: 'solid'
        }
      }
    },
  ],

    
      yAxis: [{
        type: 'log',
        name: 'Normalized Amplitude x / dB',
        min: 0.01, max: 1.1,
        minorSplitLine: {
          show: true,
          lineStyle: {
            color: 'lightgray',  // Farbe der kleinen Zwischen-Gitterlinien
            type: 'dotted'
          }
        },
        axisLabel: {
          color: '#e6e1e6',
          formatter: (value : number) => value !== 0 ? `${10 * Math.log10(value / 1)}` : '',
          inside: true,
          align: 'left',
          verticalAlign: 'middle',
          padding: [0, 10, 0, 0]
        },
        splitLine: {
          show: true,
          lineStyle: {
              color: '#444444',
              width: 1,
              type: 'solid'
          }
        }
      },{
        type: 'log',
        gridIndex: 1,
        name: 'Normalized Amplitude y / dB',
        nameLocation: "end",
        nameGap: 10,
        min: 0.01, max: 1.1,
        minorSplitLine: {
          show: true,
          lineStyle: {
            color: 'lightgray',  // Farbe der kleinen Zwischen-Gitterlinien
            type: 'dotted'
          }
        },
        axisLabel: {
          color: '#e6e1e6',
          formatter: (value : number) => value !== 0 ? `${10 * Math.log10(value / 1)}` : '',
          inside: true,
          align: 'left',
          verticalAlign: 'middle',
          padding: [0, 10, 0, 0] // Optional für Feinanpassung
        },
        splitLine: {
          show: true,
          lineStyle: {
              color: '#444444', // Grün für Y-Achse
              width: 1,
              type: 'solid'
          }
        }
      },
      ],
      series: [],
      animation: false,
    };

    // Display the chart using the configuration items and data just specified.
    myChart.setOption(option);

    
    this.store.select(createSelector(
      arrayConfigFeature.samplePattern,
      arrayConfigFeature.selectFnbw,
      arrayConfigFeature.selectHpbw,
      exportFeature.selectResultUnits,
      (state, fnbw, hpbw, resultSpace) => ({
        series: [
          {
            name: 'u',
            type: 'line',
            showSymbol: false,
            lineStyle: {
              color: 'rgba(192, 0, 0, 0.8)',
            },
            data: state.map(u => [resultSpace === ResultSpace.AZEL ? 180*Math.atan((u.x) / (Math.sqrt(1 - u.x**2))) / Math.PI : u.x, u.y]),
            markLine: {
              symbol: ['none', 'none'],
              label: { show: false },
              data: [{ yAxis: 0.1 }]
            },
            markArea: {
              itemStyle: {
                color: 'rgba(255, 0, 0, 0.1)'
              },
              label: {
                position: ['100%', '20%']
              },
              data: [
                [
                  { 
                    name: 'FNBW',
                    value: Math.abs(fnbw.secondZero! - fnbw.firstZero!),
                    xAxis: fnbw.firstZero,
                  }, { xAxis: fnbw.secondZero}
                ], // xAxis + yAxis für Bereich
                [
                  { 
                    grid: 1,
                    name: 'HBPW',

                    value: Math.abs(hpbw.secondZero! - hpbw.firstZero!),
                    xAxis: hpbw.firstZero,
                  }, { xAxis: hpbw.secondZero}
                ], // xAxis + yAxis für Bereich                       
                ]
              }
          }, {
            name: 'v',
            xAxisIndex: 1,
            yAxisIndex: 1,
            type: 'line',
            showSymbol: false,
            data: state.map(u => [u.x, u.y]),
            // markArea: {
            //   name: 'HPBW',
            //   itemStyle: {
            //     color: 'rgba(255, 173, 177, 0.4)'
            //   },
            //   data: [
            //     [{ xAxis: -0.3, yAxis: -1 }, { xAxis: 0.3, yAxis: 1 }], // xAxis + yAxis für Bereich
            //     [{ xAxis: -0.1 }, { xAxis: 0.1 }]
            //   ]
            // }
          }
        ]
      }))).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(options => {
      myChart.setOption(options, false);
    });


    // this.store.select(arrayConfigFeature.samplePattern).subscribe(state => {      
    //   chart.data.datasets[2].data = state;
    //   chart.update();
    // });


    // this.store.select(arrayConfigFeature.sampleDerrivate).subscribe(state => {
    //   chart.data.datasets[3].data = state;
    //   chart.update();
    // });
  }
}
