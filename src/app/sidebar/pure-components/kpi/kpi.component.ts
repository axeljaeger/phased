import { DecimalPipe } from '@angular/common';
import { Component, inject, input, OnInit } from '@angular/core';
import { RangeKpi } from 'src/app/store/arrayConfig.state';
import { ExportActions, ResultSpace, exportFeature } from 'src/app/store/export.state';

import { MatButtonToggle, MatButtonToggleGroup } from '@angular/material/button-toggle';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';


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
export class KPIComponent implements OnInit {
  kpis = input<{fnbw : RangeKpi, hpbw: RangeKpi}>();
  public ResultSpace = ResultSpace;
  public resultSpaceControl = new FormControl<ResultSpace>(ResultSpace.UV);
  readonly store = inject(Store);


  ngOnInit(): void {
    this.store.select(exportFeature.selectResultUnits).subscribe((resultSpace : ResultSpace) => {
      this.resultSpaceControl.setValue(resultSpace, {emitEvent: false});
    });


    this.resultSpaceControl.valueChanges.subscribe((resultSpace) => {
      this.store.dispatch(ExportActions.setResultUnit({unit: resultSpace!}));
    });
  }
}
