import { Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

import { MatButtonToggle, MatButtonToggleGroup } from '@angular/material/button-toggle';
import { MatFormField, MatInput, MatLabel, MatSuffix } from '@angular/material/input';

import { Store } from '@ngrx/store';

import { ArrayConfigActions, arrayConfigFeature, FrequencyMultiplier } from 'src/app/store/arrayConfig.state';

@Component({
  selector: 'app-excitation',
  imports: [  
        MatButtonToggle,
        MatButtonToggleGroup,
        MatInput,
        MatFormField,
        MatSuffix,
        MatLabel,
        ReactiveFormsModule
   ],
  templateUrl: './excitation.component.html',
  styleUrl: './excitation.component.scss'
})
export class ExcitationComponent {
  constructor() {
    this.store.select(arrayConfigFeature.selectEnvironment)
      .pipe(takeUntilDestroyed()).subscribe(env => 
      this.form.patchValue(env, { emitEvent: false })
    );

    this.form.valueChanges
      .pipe(takeUntilDestroyed()).subscribe(val => 
      this.store.dispatch(ArrayConfigActions.setExcitationFrequency(val))
    );
  }
  
  fb = inject(FormBuilder);
  store = inject(Store);
  public form = this.fb.group({
    excitationFrequencyMultiplier: ['kHz' as FrequencyMultiplier],
    excitationFrequencyBase: [0],
  });

  public environment = this.store.selectSignal(arrayConfigFeature.selectEnvironment);
}
