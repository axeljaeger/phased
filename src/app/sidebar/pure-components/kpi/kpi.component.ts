import { Component, computed, effect, inject, input, output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { MatButtonToggle, MatButtonToggleGroup } from '@angular/material/button-toggle';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { ResultSpace } from 'src/app/store/export.state';
import { Angle } from '@babylonjs/core/Maths/math.path';
import { RangeKpi, StoreService } from 'src/app/store/store.service';
import { uv2azel } from 'src/app/utils/uv';

export type HoveredKpi = '' | 'HpbwU' | 'FnbwU' | 'HpbwV' | 'FnbwV';

@Component({
  selector: 'app-kpi',
  imports: [ 
    MatButtonToggle,
    MatButtonToggleGroup,
    ReactiveFormsModule 
  ],
  templateUrl: './kpi.component.html',
  styleUrl: './kpi.component.scss'
})
export class KPIComponent {
  readonly store = inject(StoreService);
  kpis = input<{ u: {fnbw : RangeKpi, hpbw: RangeKpi}, v: {fnbw : RangeKpi, hpbw: RangeKpi}}>();
  public ResultSpace = ResultSpace;
  public resultSpaceControl = new FormControl<ResultSpace>(ResultSpace.UV);
  public resultSpace = this.store.resultUnits;

  hoveredKpi = output<HoveredKpi>();

  public resultRows = computed(() => {
    const kpis = this.kpis();
    if (kpis) {
      const hpbwu = kpis.u.hpbw;
      const fnbwu = kpis.u.fnbw;

      const hpbwv = kpis.v.hpbw;
      const fnbwv = kpis.v.fnbw;

      const hasHpbwu = hpbwu?.firstZero !== null && hpbwu?.secondZero !== null;
      const hasFnbwu = fnbwu?.firstZero !== null && fnbwu?.secondZero !== null;

      const hasHpbwv = hpbwv?.firstZero !== null && hpbwv?.secondZero !== null;
      const hasFnbwv = fnbwv?.firstZero !== null && fnbwv?.secondZero !== null;

      if (this.resultSpace() === ResultSpace.AZEL) {
        const hpbwAZ1u = uv2azel({ u: hpbwu.firstZero!, v: 0}).az;
        const hpbwAZ2u = uv2azel({ u: hpbwu.secondZero!, v: 0}).az;

        const fnbwAZ1u = uv2azel({ u: fnbwu.firstZero!, v: 0}).az;
        const fnbwAZ2u = uv2azel({ u: fnbwu.secondZero!, v: 0}).az;

        const hpbwAZ1v = uv2azel({ u: 0, v: hpbwv.firstZero! }).el;
        const hpbwAZ2v = uv2azel({ u: 0, v: hpbwv.secondZero! }).el;

        const fnbwAZ1v = uv2azel({ u: 0, v: fnbwv.firstZero! }).el;
        const fnbwAZ2v = uv2azel({ u: 0, v: fnbwv.secondZero! }).el;

        return [
          [ 
            'AZ', 
            hasHpbwu !== null ? `${Angle.FromRadians(hpbwAZ2u - hpbwAZ1u).degrees().toFixed(2)}°` : '-', 
            hasFnbwu && fnbwu?.secondZero !== null ? `${Angle.FromRadians(fnbwAZ2u - fnbwAZ1u).degrees().toFixed(2)}°` : '-',
            '-'
          ],
          [ 
            'EL', 
            hasHpbwv ? `${Angle.FromRadians(hpbwAZ2v - hpbwAZ1v).degrees().toFixed(2)}°` : '-', 
            hasFnbwv ? `${Angle.FromRadians(fnbwAZ2v - fnbwAZ1v).degrees().toFixed(2)}°` : '-',
            '-'
          ],
        ];
      } else {
        return [
          [ 'u', hasHpbwu ? (hpbwu.secondZero! - hpbwu.firstZero!).toFixed(2) : '-', hasFnbwu ? (fnbwu.secondZero! - fnbwu.firstZero!).toFixed(2) : '-', ''],
          [ 'v', hasHpbwv ? (hpbwv.secondZero! - hpbwv.firstZero!).toFixed(2) : '-', hasFnbwv ? (fnbwv.secondZero! - fnbwv.firstZero!).toFixed(2) : '-', ''],
        ];
      }
    }
    return [
      ['', '', '', ''], 
      ['', '', '', '']
    ];
  });

  constructor() {
    effect(() => this.resultSpaceControl.setValue(this.store.resultUnits(), {emitEvent: false}));

    this.resultSpaceControl.valueChanges.pipe(takeUntilDestroyed())
      .subscribe((resultSpace) => this.store.setResultUnit(resultSpace!) );
  }
}
