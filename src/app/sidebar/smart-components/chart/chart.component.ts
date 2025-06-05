import { Component, DestroyRef, ElementRef, OnInit, effect, inject, viewChild } from '@angular/core';

import { ResultSpace } from 'src/app/store/export.state';

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
import { StoreService } from 'src/app/store/store.service';

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

const condUToAz = (convert: boolean, u : number) => convert ? 180*Math.atan(u / (Math.sqrt(1 - u**2))) / Math.PI : u;
const condVToEl = (convert: boolean, v : number) => convert ? 180*Math.atan(v / (Math.sqrt(1 - v**2))) / Math.PI : v;

@Component({
    selector: 'app-chart',
    templateUrl: './chart.component.html',
    styleUrl: './chart.component.scss'
})
export class ChartComponent implements OnInit {
  private readonly store = inject(StoreService);
  destroyRef = inject(DestroyRef);

  echartDiv = viewChild.required<ElementRef<HTMLElement>>('echartDiv');

  updateChartEffect =     effect(() => {
    const resultUnit = this.store.resultUnits();
    const hoveredKpi = this.store.hoveredKpi();

    const config = ({
      yAxis: [{
        type: 'log',
        name: `Normalized Amplitude ${resultUnit === 'uv' ? 'u' : 'AZ'} / dB`,
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
      },
      
      // V-Space
      {
        type: 'log',
        gridIndex: 1,
        name: `Normalized Amplitude ${resultUnit === 'uv' ? 'v' : 'EL'} / dB`,
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
      xAxis: [{
        name: 'x',
        type: 'value',
        axisLabel: {
            inside: false,
            align: 'center',
            verticalAlign: 'middle',
            padding: [10, 10, 10, 10], // Optional für Feinanpassung
            color: '#e6e1e6',
            formatter: (value : number) => resultUnit === 'uv' ?  `${value.toFixed(1)}` : `${value.toFixed(0)}°`,
        },
        splitNumber: 4,
        min: resultUnit === 'uv' ? -1 : -90,
        max: resultUnit === 'uv' ? 1 : 90,
        splitLine: {
          show: true,
          lineStyle: {
              color: '#444444', // Grün für Y-Achse
              width: 1,
              type: 'solid'
          }
        }
      },
      // V-Space
      {
        gridIndex: 1,
        name: 'x2',
        type: 'value',
        axisLabel: {
            inside: false,
            align: 'center',
            verticalAlign: 'middle',
            padding: [0, 0, 0, 0], // Optional für Feinanpassung
            color: '#e6e1e6',
            formatter: (value : number) => resultUnit === 'uv' ?  `${value.toFixed(1)}` : `${value.toFixed(0)}°`,
        },
        min: resultUnit === 'uv' ? -1 : -90,
        max: resultUnit === 'uv' ? 1 : 90,
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
      series: [
        {
          name: 'u',
          type: 'line',
          showSymbol: false,
          lineStyle: {
            color: 'rgba(192, 0, 0, 0.8)',
          },
          data: this.store.samplePatternU().map(u => [condUToAz(resultUnit === ResultSpace.AZEL, u.x), u.y]),
          markLine: {
            symbol: ['none', 'none'],
            label: { show: false },
            lineStyle: {
              color: 'red',
              width: 2,
              type: 'dashed'
            },
            data: hoveredKpi === 'HpbwU' ? [
              { 
                grid: 1,
                xAxis: condUToAz(resultUnit === ResultSpace.AZEL, this.store.hpbwU().firstZero!),
              }, { xAxis: condUToAz(resultUnit === ResultSpace.AZEL, this.store.hpbwU().secondZero!)}
            ] : hoveredKpi === 'FnbwU' ? [                  
              { 
                grid: 1,
                xAxis: condUToAz(resultUnit === ResultSpace.AZEL, this.store.fnbwU().firstZero!),
              }, { xAxis: condUToAz(resultUnit === ResultSpace.AZEL, this.store.fnbwU().secondZero!) }
            ] : [], 
          },
          markArea: {
            silent: true,
            itemStyle: {
              color: 'rgba(255, 0, 0, 0.1)'
            },
            label: {
              show: false
            },
            data: [
              hoveredKpi === 'HpbwU' ? [
                { 
                  xAxis: condUToAz(resultUnit === ResultSpace.AZEL, this.store.hpbwU().firstZero!),
                }, { xAxis: condUToAz(resultUnit === ResultSpace.AZEL, this.store.hpbwU().secondZero!)}
              ] : hoveredKpi === 'FnbwU' ? [                  
                { 
                  grid: 1,
                  xAxis: condUToAz(resultUnit === ResultSpace.AZEL, this.store.fnbwU().firstZero!),
                }, { xAxis: condUToAz(resultUnit === ResultSpace.AZEL, this.store.fnbwU().secondZero!) }
              ] : [
                  {
                    grid: 1,
                    xAxis: 0,
                  }, { xAxis: 0}
              ],                     
              ]
            }
        }, {
          name: 'v',
          xAxisIndex: 1,
          yAxisIndex: 1,
          type: 'line',
          showSymbol: false,
          data: this.store.samplePatternV().map(v => [resultUnit === ResultSpace.AZEL ? 180* Math.asin(v.x) / Math.PI : v.x, v.y]),
          markLine: {
            symbol: ['none', 'none'],
            label: { show: false },
            lineStyle: {
              color: 'rgba(64, 192, 64, 1.0)',
              width: 2,
              type: 'dashed'
            },
            data:  hoveredKpi === 'HpbwV' ? [
              { 
                grid: 1,
                xAxis: condVToEl(resultUnit === ResultSpace.AZEL, this.store.hpbwV().firstZero!),
              }, { xAxis: condVToEl(resultUnit === ResultSpace.AZEL, this.store.hpbwV().secondZero!)}
            ] : hoveredKpi === 'FnbwV' ? [                  
              { 
                grid: 1,
                xAxis: condVToEl(resultUnit === ResultSpace.AZEL, this.store.fnbwV().firstZero!),
              }, { xAxis: condVToEl(resultUnit === ResultSpace.AZEL, this.store.fnbwV().secondZero!) }
            ] : [], 
          },
          markArea: {
            silent: true,
            itemStyle: {
              color: 'rgba(0, 255, 0, 0.1)'
            },
            label: {
              show: false
            },
            data: [
              hoveredKpi === 'HpbwV' ? [
                { 
                  xAxis: condVToEl(resultUnit === ResultSpace.AZEL, this.store.hpbwV().firstZero!),
                }, { xAxis: condVToEl(resultUnit === ResultSpace.AZEL, this.store.hpbwV().secondZero!)}
              ] : hoveredKpi === 'FnbwV' ? [                  
                { 
                  grid: 1,
                  xAxis: condVToEl(resultUnit === ResultSpace.AZEL, this.store.fnbwV().firstZero!),
                }, { xAxis: condVToEl(resultUnit === ResultSpace.AZEL, this.store.fnbwV().secondZero!) }
              ] : [
                  {
                    grid: 1,
                    xAxis: 0,
                  }, { xAxis: 0}
              ],                     
              ]
            }
        }
      ]
    });
    this.myChart?.setOption(config);
  });
  
  myChart: echarts.ECharts;
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


    this.myChart = echarts.init(this.echartDiv().nativeElement);

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
          formatter: (value : number) =>`${value.toFixed(0)}°`,
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
    this.myChart.setOption(option);
  }
}
