import { Component, effect, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormField, MatInput, MatLabel, MatSuffix } from '@angular/material/input';

import { StoreService } from 'src/app/store/store.service';

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
export class TransducerComponent {
  store = inject(StoreService);
  public diameter = new FormControl(0);

  constructor() {
    this.diameter.valueChanges
      .pipe(takeUntilDestroyed()).subscribe(val => 
        this.store.setTransducerDiameter(val ? val * 1e-3 : null)
    );

    effect(() => { 
      this.diameter.patchValue(this.store.arrayConfig().transducerDiameter * 1e3, { emitEvent: false })
    });  
  }
}
