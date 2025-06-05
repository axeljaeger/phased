import { Component, computed, effect, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ResultAspect } from '../../../view3d/materials/rayleigh.material';

import { Results } from 'src/app/store/viewportConfig.state';
import { ResultSet } from 'src/app/store/rayleigh.state';
import { MatButtonToggle, MatButtonToggleGroup } from '@angular/material/button-toggle';
import { StoreService } from 'src/app/store/store.service';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
    selector: 'app-rayleigh',
    templateUrl: './rayleigh.component.html',
    styleUrls: ['./rayleigh.component.scss'],
    imports: [ ReactiveFormsModule, MatButtonToggle, MatButtonToggleGroup, MatCheckboxModule ]
})
export class RayleighComponent {
  private store = inject(StoreService);
  private fb = inject(FormBuilder);

  public rayleighVisible$ = computed(() => this.store.enabledResults().includes(Results.RayleighIntegral));
  public rayleighVisible = this.fb.control(false);
  public rayleighAspect = this.fb.control(0);
  public resultSet = this.fb.control(ResultSet.XZPlane);

  // Publish enums to template
  public ResultAspect = ResultAspect;
  public ResultSet = ResultSet;

  constructor() {
    this.rayleighVisible.valueChanges.pipe(takeUntilDestroyed()).subscribe(val => {
      this.store.setResultVisible(Results.RayleighIntegral, val!);
    });

    this.rayleighAspect.valueChanges.pipe(takeUntilDestroyed()).subscribe(val => {
      this.store.setAspect(val!);
    })
    
    effect(() => {
      this.rayleighVisible.patchValue(this.rayleighVisible$(), { emitEvent: false })
    });

    this.resultSet.valueChanges.pipe(takeUntilDestroyed()).subscribe(val => {
      this.store.setResultSet(val!);
    })
  }
}
