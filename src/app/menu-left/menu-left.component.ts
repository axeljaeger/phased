import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { EngineService } from '../engine.service';

import { Store } from '@ngrx/store';
import { ArrayConfig } from '../store/reducers/arrayConfig.reducer'
import { setConfig } from '../store/actions/arrayConfig.actions';
import { Observable } from 'rxjs';
import { selectTransducers, Transducer } from '../store/selectors/arrayConfig.selector';
@Component({
  selector: 'app-menu-left',
  templateUrl: './menu-left.component.html',
  styleUrls: ['./menu-left.component.css']
})
export class MenuLeftComponent implements OnInit {
  public arrayConfig: any;
  public transducers$ : Observable<Array<Transducer>>;

  constructor(
    private store: Store<{ environment: number, arrayConfig: ArrayConfig }>, 
    public engineService: EngineService, 
    private fb: FormBuilder) { 
      this.transducers$ = store.select(selectTransducers);
    }

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
    
    this.store.select('arrayConfig').subscribe(config => {
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
