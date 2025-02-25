import { Component, inject, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormField, MatInput, MatLabel, MatSuffix } from '@angular/material/input';
import { Store } from '@ngrx/store';
import { ArrayConfig, ArrayConfigActions, arrayConfigFeature } from 'src/app/store/arrayConfig.state';

@Component({
  selector: 'app-transducer',
  imports: [
    MatInput,
    MatFormField,
    MatSuffix,
    MatLabel,
    ReactiveFormsModule],
  templateUrl: './transducer.component.html',
  styleUrl: './transducer.component.scss'
})
export class TransducerComponent implements OnInit {
  store = inject(Store);
  public diameter = new FormControl(0);

  ngOnInit(): void {
    this.diameter.valueChanges.subscribe(val => {
      this.store.dispatch(ArrayConfigActions.setTransducerDiameter({diameter: val ? val * 1e-3 : null}));
    });

    this.store.select(arrayConfigFeature.selectArrayConfigState).subscribe((state : ArrayConfig) => {
      this.diameter.patchValue(state.transducerDiameter * 1e3, { emitEvent: false });
    }
    );
  }
}
