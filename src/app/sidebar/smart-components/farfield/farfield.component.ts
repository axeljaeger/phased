import { Component, effect, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

import { MatSliderModule } from '@angular/material/slider';
import { MatDividerModule } from '@angular/material/divider';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { Results } from 'src/app/store/viewportConfig.state';
import { StoreService } from 'src/app/store/store.service';

@Component({
    selector: 'app-farfield',
    templateUrl: './farfield.component.html',
    styleUrls: ['./farfield.component.scss'],
    imports: [MatExpansionModule, MatIconModule, MatCheckboxModule, ReactiveFormsModule, MatDividerModule, MatSliderModule]
})
export class FarfieldComponent {
  store = inject(StoreService);
  fb = inject(FormBuilder);
  
  public farfieldVisible = this.fb.control(false);

  constructor() {
    effect(() => {
      this.farfieldVisible.setValue(this.store.enabledResults().includes(Results.Farfield), {emitEvent: false});
    });

    this.farfieldVisible.valueChanges.pipe(takeUntilDestroyed()).subscribe(val => {
      this.store.setResultVisible(Results.Farfield, val!);
    });
  }
}
