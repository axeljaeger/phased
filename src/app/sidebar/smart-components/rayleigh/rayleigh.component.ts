import { Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { ResultAspect } from '../../../view3d/materials/rayleigh.material';

import { MatDividerModule } from '@angular/material/divider';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { Results, ResultsActions, ViewportFeature } from 'src/app/store/viewportConfig.state';
import { RayleighResultActions, ResultSet } from 'src/app/store/rayleigh.state';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonToggle, MatButtonToggleGroup } from '@angular/material/button-toggle';

@Component({
    selector: 'app-rayleigh',
    templateUrl: './rayleigh.component.html',
    styleUrls: ['./rayleigh.component.scss'],
    imports: [MatExpansionModule, MatIconModule, MatCheckboxModule, ReactiveFormsModule, MatDividerModule, MatFormFieldModule, MatSelectModule,
      MatButtonToggle, MatButtonToggleGroup
    ]
})
export class RayleighComponent {
  private store = inject(Store);
  private fb = inject(FormBuilder);

  public rayleighVisible$ = this.store.select(ViewportFeature.selectResultEnabled(Results.RayleighIntegral));
  public rayleighVisible = this.fb.control(false);
  public rayleighAspect = this.fb.control(0);
  public resultSet = this.fb.control(ResultSet.XZPlane);

  // Publish enums to template
  public ResultAspect = ResultAspect;
  public ResultSet = ResultSet;

  constructor() {
    this.rayleighVisible.valueChanges.pipe(takeUntilDestroyed()).subscribe(val => {
      this.store.dispatch(ResultsActions.setResultVisible({ result: Results.RayleighIntegral, visible: val! }));
    });

    this.rayleighAspect.valueChanges.pipe(takeUntilDestroyed()).subscribe(val => {
      this.store.dispatch(RayleighResultActions.setResultAspect({ aspect: val! }));
    })
    this.rayleighVisible$.pipe(takeUntilDestroyed()).subscribe(val => this.rayleighVisible.patchValue(val, { emitEvent: false }));

    this.resultSet.valueChanges.pipe(takeUntilDestroyed()).subscribe(val => {
      this.store.dispatch(RayleighResultActions.setResultSet({ resultSet: val! }));
    })
  }
}
