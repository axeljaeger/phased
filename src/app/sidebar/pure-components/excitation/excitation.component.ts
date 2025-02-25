import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonToggle, MatButtonToggleGroup } from '@angular/material/button-toggle';
import { MatFormField, MatInput, MatLabel, MatSuffix } from '@angular/material/input';
import { Store } from '@ngrx/store';
import { EnvironmentActions, environmentFeature, EnvironmentState, Multiplier } from 'src/app/store/environment.state';

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
export class ExcitationComponent implements OnInit {
  ngOnInit(): void {
    this.store.select(environmentFeature.selectEnvironmentState).subscribe((env : EnvironmentState) => {
      this.form.patchValue(env, { emitEvent: false });
    });

    this.form.valueChanges.subscribe(val => {
      this.store.dispatch(EnvironmentActions.setExcitationFrequency(val));
    });
  }
  
  fb = inject(FormBuilder);
  store = inject(Store);
  public Multiplier = Multiplier;
  public form = this.fb.group({
    multiplier: [Multiplier.kHz],
    excitationFrequencyBase: [0],
  });

  public environment = this.store.selectSignal(environmentFeature.selectEnvironmentState);
}
