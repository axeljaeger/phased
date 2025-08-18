import { Component, computed, effect, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatFormField, MatInput, MatLabel, MatSuffix } from '@angular/material/input';

import { StoreService, TransducerModel } from 'src/app/store/store.service';

@Component({
  selector: 'app-transducer',
  imports: [
    MatInput,
    MatFormField,
    MatSuffix,
    MatLabel,
    ReactiveFormsModule,
    MatButtonToggleModule
  ],
  templateUrl: './transducer.component.html',
  styleUrl: './transducer.component.scss'
})
export class TransducerComponent {
  store = inject(StoreService);
  transducerModel = computed(() => this.store.arrayConfig().transducerModel);

  public transducerConfig = new FormGroup({
    transducerModel: new FormControl<TransducerModel>('Point'),
    transducerDiameter: new FormControl(0)
  });
  
  updateStoreFromForm = this.transducerConfig.valueChanges
      .pipe(takeUntilDestroyed()).subscribe(val => {
        this.store.setTransducer({
          ...val.transducerDiameter ? {transducerDiameter: val.transducerDiameter * 1e-3} : {},
          ...val.transducerModel ? {transducerModel: val.transducerModel} : {}
        });
      });

  updateFormFromStore = effect(() => {
      const config = this.store.arrayConfig();
      this.transducerConfig.patchValue({
        transducerModel: config.transducerModel,
        transducerDiameter: config.transducerDiameter * 1e3,
      }, { emitEvent: false })
  });  
}

