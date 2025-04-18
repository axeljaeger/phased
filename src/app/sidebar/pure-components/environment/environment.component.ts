import { Component, effect, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';


import { MatButtonToggle, MatButtonToggleGroup } from '@angular/material/button-toggle';
import { MatFormField, MatInput, MatLabel, MatSuffix } from '@angular/material/input';

import { StoreService, Environment, EnvironmentHint } from 'src/app/store/store.service';


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
  store = inject(StoreService);

  public form = this.fb.group({
    speedOfSound: [{value: 0, disabled: true}],
    environmentHint: ['Air' as EnvironmentHint],
  });

  private formSignal = toSignal(this.form.valueChanges);

  patchForm = effect(() => this.form.patchValue(this.store.arrayConfig().environment, { emitEvent: false }));
  updateStore = effect(() => {
    const val = this.formSignal()
    if (val !== undefined) {
      this.store.setEnvironment(val as Partial<Environment>);
      this.form.controls.environmentHint.value === 'Custom' ?
      this.form.controls.speedOfSound.enable({emitEvent: false}) : 
      this.form.controls.speedOfSound.disable({emitEvent: false});
    }
  });
}
