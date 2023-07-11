import { Component, OnInit } from '@angular/core';

import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

import { Store } from '@ngrx/store';
import { ArrayConfig } from '../../../store/reducers/arrayConfig.reducer'
import { ArrayConfigActions } from '../../../store/actions/arrayConfig.actions';
import { selectArrayConfig } from '../../../store/selectors/arrayConfig.selector';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { NgIf } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatExpansionModule } from '@angular/material/expansion';

@Component({
    selector: 'app-array-config',
    templateUrl: './array-config.component.html',
    styleUrls: ['./array-config.component.css'],
    standalone: true,
    imports: [MatExpansionModule, ReactiveFormsModule, MatButtonToggleModule, MatIconModule, NgIf, MatFormFieldModule, MatInputModule]
})
export class ArrayConfigComponent implements OnInit {
  public arrayConfig: any;

  constructor(
    private store: Store, 
    private fb: FormBuilder) { }

  ngOnInit(): void {
    this.arrayConfig = this.fb.group({
      arrayType: 'ura',
      uraConfig: this.fb.group({
        elementsX: this.fb.control(0),
        elementsY: this.fb.control(0),
        pitchX: this.fb.control(0),
        pitchY: this.fb.control(0),
      }),
      circularConfig: this.fb.group({
        radius: this.fb.control(0),
        elements: this.fb.control(0),
      }),
    });
    
    this.store.select(selectArrayConfig).subscribe(config => {
      this.arrayConfig.patchValue(config, 
        { 
          emitEvent: false, // Avoid infinite recursion
          emitModelToViewChange: true, 
          emitViewToModelChange: true 
        });
    });

    this.arrayConfig.valueChanges.subscribe(
      (val : ArrayConfig) => this.store.dispatch(ArrayConfigActions.setConfig(val))
    );
  }
}
