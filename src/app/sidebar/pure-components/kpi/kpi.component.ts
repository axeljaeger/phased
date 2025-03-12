import { DecimalPipe } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { MatButtonToggle, MatButtonToggleGroup } from '@angular/material/button-toggle';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { Store } from '@ngrx/store';

import { RangeKpi } from 'src/app/store/arrayConfig.state';
import { ExportActions, ResultSpace, exportFeature } from 'src/app/store/export.state';

@Component({
  selector: 'app-kpi',
  imports: [ 
    DecimalPipe,
    MatButtonToggle,
    MatButtonToggleGroup,
    ReactiveFormsModule 
  ],
  templateUrl: './kpi.component.html',
  styleUrl: './kpi.component.scss'
})
export class KPIComponent {
  kpis = input<{fnbw : RangeKpi, hpbw: RangeKpi}>();
  public ResultSpace = ResultSpace;
  public resultSpaceControl = new FormControl<ResultSpace>(ResultSpace.UV);
  readonly store = inject(Store);


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
