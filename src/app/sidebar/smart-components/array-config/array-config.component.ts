import { Component, OnInit } from '@angular/core';

import { FormBuilder } from '@angular/forms';
import { EngineService } from '../../../engine.service';

import { Store } from '@ngrx/store';
import { ArrayConfig } from '../../../store/reducers/arrayConfig.reducer'
import { setConfig } from '../../../store/actions/arrayConfig.actions';
import { selectArrayConfig } from '../../../store/selectors/arrayConfig.selector';

@Component({
  selector: 'app-array-config',
  templateUrl: './array-config.component.html',
  styleUrls: ['./array-config.component.css']
})
export class ArrayConfigComponent implements OnInit {
  public arrayConfig: any;

  constructor(
    private store: Store, 
    public engineService: EngineService, 
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
      (val : ArrayConfig) => this.store.dispatch(setConfig(val))
    );
  }
}
