import { Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

import { Store } from '@ngrx/store';

import { MatButtonToggle, MatButtonToggleGroup } from '@angular/material/button-toggle';
import { MatFormField, MatInput, MatLabel, MatSuffix } from '@angular/material/input';

import { EnvironmentHint, arrayConfigFeature, ArrayConfigActions } from 'src/app/store/arrayConfig.state';

@Component({
  selector: 'app-environment',
  imports: [
    MatButtonToggle,
    MatButtonToggleGroup,
    MatInput,
    MatFormField,
    MatSuffix,
    MatLabel,
    ReactiveFormsModule
  ],
  templateUrl: './environment.component.html',
  styleUrl: './environment.component.scss'
})
export class EnvironmentComponent {
  fb = inject(FormBuilder);
  store = inject(Store);

  public form = this.fb.group({
    speedOfSound: [{value: 0, disabled: true}],
    environmentHint: ['Air' as EnvironmentHint],
  });

  constructor(){
    this.store.select(arrayConfigFeature.selectEnvironment)
      .pipe(takeUntilDestroyed()).subscribe(env => 
      this.form.patchValue(env, { emitEvent: false })
    );

    this.form.valueChanges
      .pipe(takeUntilDestroyed()).subscribe(val => {
      this.store.dispatch(ArrayConfigActions.setEnvironment(this.form.value));
      this.form.controls.environmentHint.value === 'Custom' ?
        this.form.controls.speedOfSound.enable({emitEvent: false}) : 
        this.form.controls.speedOfSound.disable({emitEvent: false});
    });
  }
}
