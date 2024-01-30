import { Component, OnInit, inject } from '@angular/core';

import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

import { Store } from '@ngrx/store';
import { ArrayConfig, ArrayConfigActions, arrayConfigFeature } from '../../../store/arrayConfig.state'
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatExpansionModule } from '@angular/material/expansion';

@Component({
    selector: 'app-array-config',
    templateUrl: './array-config.component.html',
    styleUrls: ['./array-config.component.css'],
    standalone: true,
    imports: [MatExpansionModule, ReactiveFormsModule, MatButtonToggleModule, MatIconModule, MatFormFieldModule, MatInputModule]
})
export class ArrayConfigComponent implements OnInit {
  private store = inject(Store); 
  private fb = inject(FormBuilder);
  public arrayConfig =this.fb.group({
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
    }),
  });

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
}
