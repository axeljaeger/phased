import { DecimalPipe } from '@angular/common';
import { Component, inject, input, output } from '@angular/core';

import { ReactiveFormsModule } from '@angular/forms';

import { PSFResult, StoreService } from 'src/app/store/store.service';

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
}
