import { Component, effect, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCheckbox } from '@angular/material/checkbox';

import { ArrayConfig, StoreService } from 'src/app/store/store.service';

@Component({
    selector: 'app-array-config',
    templateUrl: './array-config.component.html',
    styleUrls: ['./array-config.component.scss'],
    imports: [
        MatButtonToggleModule,
        MatFormFieldModule,
        MatInputModule,
        ReactiveFormsModule,
        MatCheckbox,
    ]
})
export class ArrayConfigComponent {
  private store = inject(StoreService);
  private fb = inject(FormBuilder);
  public arrayConfig = this.fb.group({
      type: 'ura',
      elementsX: this.fb.control(0),
      elementsY: this.fb.control(0),
      pitchX: this.fb.control(0),
      pitchY: this.fb.control(0),
      diameter: this.fb.control(0.05),
      elementCount: this.fb.control(5),
      startWithZero: this.fb.control(false),
      omitCenter: this.fb.control(false),
      elements: this.fb.control(2),
      pitch: this.fb.control(5),
  });

  constructor() {
    effect(() => {
      const config = this.store.arrayConfig().config;
      this.arrayConfig.patchValue({
        ...config,
        ...config.type === 'ura' ? {
        pitchX: config.pitchX * 1e3,
        pitchY: config.pitchY * 1e3,
        } : {},
        ...config.type === 'hex' ? {
          elements: config.elements,
          pitch: config.pitch * 1e3,
        } : {},
      }, { emitEvent: false })
    });

    this.arrayConfig.valueChanges.pipe(takeUntilDestroyed()).subscribe(value => 
      this.store.setConfig({config: {
        ...value,
        ...value.type === 'ura' && value.pitchX !== undefined && value.pitchX !== null ? { pitchX: value.pitchX * 1e-3 } : {},
        ...value.type === 'ura' && value.pitchY !== undefined && value.pitchY !== null ? { pitchY: value.pitchY * 1e-3 } : {},
        ...value.type === 'hex' && value.pitch !== undefined && value.pitch !== null ? { pitch: value.pitch * 1e-3 } : {},
      }} as ArrayConfig));
  }
}
