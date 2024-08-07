import { Component, OnInit, inject } from '@angular/core';

import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

import { Store } from '@ngrx/store';
import { ArrayConfig, ArrayConfigActions, arrayConfigFeature } from '../../../store/arrayConfig.state'
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { presets } from '../../../presets'


@Component({
  selector: 'app-array-config',
  templateUrl: './array-config.component.html',
  styleUrls: ['./array-config.component.scss'],
  standalone: true,
  imports: [
    MatButtonModule,
    MatButtonToggleModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatMenuModule,
    ReactiveFormsModule,
  ]
})
export class ArrayConfigComponent implements OnInit {
  private store = inject(Store);
  private fb = inject(FormBuilder);
  public arrayConfig = this.fb.group({
    arrayType: 'ura',
    uraConfig: this.fb.group({
      elementsX: this.fb.control(0),
      elementsY: this.fb.control(0),
      pitchX: this.fb.control(0),
      pitchY: this.fb.control(0),
    }),
    roundConfig: this.fb.group({
      diameter: this.fb.control(0),
      elementCount: this.fb.control(0),
      startElement: this.fb.control(0),
    }),
  });
  presets = presets;

  ngOnInit(): void {
    this.store.select(arrayConfigFeature.selectArrayConfigState).subscribe(config => {
      this.arrayConfig.patchValue(config,
        {
          emitEvent: false, // Avoid infinite recursion
        });
    });

    this.arrayConfig.valueChanges.subscribe(
      (value) => this.store.dispatch(ArrayConfigActions.setConfig(value as ArrayConfig))
    );
  }
  loadPreset(presetIndex: number) {
    this.store.dispatch(ArrayConfigActions.setConfig(this.presets[presetIndex].config));
  }
}
