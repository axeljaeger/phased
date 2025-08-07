import { DecimalPipe } from '@angular/common';
import { Component, computed, inject, input, output } from '@angular/core';

import { ReactiveFormsModule } from '@angular/forms';

import { Angle } from '@babylonjs/core/Maths/math.path';
import { PSFResult, RangeKpi, StoreService } from 'src/app/store/store.service';
import { uv2azel } from 'src/app/utils/uv';

export type HoveredKpi = '' | 'HpbwAz' | 'FnbwAz' | 'SlrAz' | 'HpbwEl' | 'FnbwEl' | 'SlrEl';

@Component({
  selector: 'app-kpi',
  imports: [ 
    ReactiveFormsModule,
    DecimalPipe
  ],
  templateUrl: './kpi.component.html',
  styleUrl: './kpi.component.scss'
})
export class KPIComponent {
  readonly store = inject(StoreService);
  kpis = input<PSFResult>();

  hoveredKpi = output<HoveredKpi>();

  public resultRows = computed(() => {
    const azkpis = this.kpis()?.az!;
    const elkpis = this.kpis()?.el!;

      const SLRu = 20*Math.log10(azkpis.sll! / azkpis.maxl!);
      const SLRv = 20*Math.log10(elkpis.sll! / elkpis.maxl!);

      return [
        [ 
          'AZ', 
          azkpis.rightHPBWCrossing! - azkpis.leftHPBWCrossing!, 
          azkpis.rightZeroCrossing! - azkpis.leftZeroCrossing!,
          SLRu
        ],
        [ 
          'EL', 
          elkpis.rightHPBWCrossing! - elkpis.leftHPBWCrossing!, 
          elkpis.rightZeroCrossing! - elkpis.leftZeroCrossing!,
          SLRv
        ],
      ];
  });
}
