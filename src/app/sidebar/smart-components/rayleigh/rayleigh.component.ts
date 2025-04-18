import { Component, computed, effect, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ResultAspect } from '../../../view3d/materials/rayleigh.material';

import { MatDividerModule } from '@angular/material/divider';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { Results } from 'src/app/store/viewportConfig.state';
import { ResultSet } from 'src/app/store/rayleigh.state';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonToggle, MatButtonToggleGroup } from '@angular/material/button-toggle';
import { StoreService } from 'src/app/store/store.service';

@Component({
    selector: 'app-rayleigh',
    templateUrl: './rayleigh.component.html',
    styleUrls: ['./rayleigh.component.scss'],
    imports: [MatExpansionModule, MatIconModule, MatCheckboxModule, ReactiveFormsModule, MatDividerModule, MatFormFieldModule, MatSelectModule,
      MatButtonToggle, MatButtonToggleGroup
    ]
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
