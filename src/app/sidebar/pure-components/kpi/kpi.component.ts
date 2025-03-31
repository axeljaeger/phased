import { Component, computed, inject, input, output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { MatButtonToggle, MatButtonToggleGroup } from '@angular/material/button-toggle';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { Store } from '@ngrx/store';

import { RangeKpi } from 'src/app/store/arrayConfig.state';
import { ExportActions, ResultSpace, exportFeature } from 'src/app/store/export.state';
import { Angle } from '@babylonjs/core/Maths/math.path';

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
  readonly store = inject(Store);
  kpis = input<{ u: {fnbw : RangeKpi, hpbw: RangeKpi}, v: {fnbw : RangeKpi, hpbw: RangeKpi}}>();
  public ResultSpace = ResultSpace;
  public resultSpaceControl = new FormControl<ResultSpace>(ResultSpace.UV);
  public resultSpace = this.store.selectSignal(exportFeature.selectResultUnits);

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
        const hpbwAZ1u = this.uv2azel(hpbwu.firstZero!, 0).az;
        const hpbwAZ2u = this.uv2azel(hpbwu.secondZero!, 0).az;

        const fnbwAZ1u = this.uv2azel(fnbwu.firstZero!, 0).az;
        const fnbwAZ2u = this.uv2azel(fnbwu.secondZero!, 0).az;

        const hpbwAZ1v = this.uv2azel(0, hpbwv.firstZero!).el;
        const hpbwAZ2v = this.uv2azel(0, hpbwv.secondZero!).el;

        const fnbwAZ1v = this.uv2azel(0, fnbwv.firstZero!).el;
        const fnbwAZ2v = this.uv2azel(0, fnbwv.secondZero!).el;

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


  public uv2azel = (u:number, v:number) => {
    const el = Math.asin(v);
    const az = Math.atan(u / Math.sqrt(1-u**2-v**2));
    return { az, el };
  }

  constructor() {
    this.store.select(exportFeature.selectResultUnits)
      .pipe(takeUntilDestroyed()).subscribe((resultSpace : ResultSpace) => {
      this.resultSpaceControl.setValue(resultSpace, {emitEvent: false});
    });


    this.resultSpaceControl.valueChanges
      .pipe(takeUntilDestroyed()).subscribe((resultSpace) => {
      this.store.dispatch(ExportActions.setResultUnit({unit: resultSpace!}));
    });
  }
}
