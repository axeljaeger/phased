import { Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';

import { MatSliderModule } from '@angular/material/slider';
import { MatDividerModule } from '@angular/material/divider';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { Results, ResultsActions, ViewportFeature } from 'src/app/store/viewportConfig.state';

@Component({
    selector: 'app-farfield',
    templateUrl: './farfield.component.html',
    styleUrls: ['./farfield.component.scss'],
    imports: [MatExpansionModule, MatIconModule, MatCheckboxModule, ReactiveFormsModule, MatDividerModule, MatSliderModule]
})
export class FarfieldComponent {
  store = inject(Store);
  fb = inject(FormBuilder);
  
  public farfieldVisible = this.fb.control(false);

  constructor() {
    this.store.select(ViewportFeature.selectResultEnabled(Results.Farfield)).pipe(takeUntilDestroyed()).subscribe(visible => {
      this.farfieldVisible.setValue(visible, {emitEvent: false});
    });

    this.farfieldVisible.valueChanges.pipe(takeUntilDestroyed()).subscribe(val => {
      this.store.dispatch(ResultsActions.setResultVisible({result: Results.Farfield, visible: val!}));
    });
  }
}
