import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonToggle, MatButtonToggleGroup } from '@angular/material/button-toggle';
import { MatFormField, MatInput, MatLabel, MatSuffix } from '@angular/material/input';
import { Store } from '@ngrx/store';
import { EnvironmentActions, environmentFeature, EnvironmentHint, EnvironmentState } from 'src/app/store/environment.state';

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
export class EnvironmentComponent implements OnInit {
  fb = inject(FormBuilder);
  store = inject(Store);
  public EnvironmentHint = EnvironmentHint;

  public form = this.fb.group({
    speedOfSound: [{value: 0, disabled: true}],
    environmentHint: [EnvironmentHint.Air]
  });

  ngOnInit(): void {
    this.store.select(environmentFeature.selectEnvironmentState).subscribe((env : EnvironmentState) => {
      this.form.patchValue(env, { emitEvent: false });
    });

    this.form.valueChanges.subscribe(val => {
      this.store.dispatch(EnvironmentActions.setEnvironment(this.form.value));
      this.form.controls.environmentHint.value === EnvironmentHint.Custom ?
        this.form.controls.speedOfSound.enable({emitEvent: false}) : 
        this.form.controls.speedOfSound.disable({emitEvent: false});
    });
  }
}
