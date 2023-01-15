import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Store } from '@ngrx/store';
import { ResultAspect } from 'src/app/view3d/materials/rayleigh.material';
import { Results } from 'src/app/store';
import { setResultAspect } from 'src/app/store/actions/rayleigh.actions';
import { setResultVisible } from 'src/app/store/actions/viewportConfig.actions';

import { selectResultEnabled } from '../../../store/selectors/viewportConfig.selector';

@Component({
  selector: 'app-rayleigh',
  templateUrl: './rayleigh.component.html',
  styleUrls: ['./rayleigh.component.css']
})
export class RayleighComponent implements OnInit {
  public rayleighVisible$ = this.store.select(selectResultEnabled(Results.RayleighIntegral));
  public rayleighVisible = this.fb.control(false);
  public rayleighAspect = this.fb.control(0);

  // Publish enum to template
  public ResultAspect = ResultAspect;

  constructor(
    private store: Store,
    private fb: FormBuilder) { }

  ngOnInit(): void {
    this.rayleighVisible.valueChanges.subscribe(val => {
      this.store.dispatch(setResultVisible({result: Results.RayleighIntegral, visible: val!}));
    });

    this.rayleighAspect.valueChanges.subscribe(val => {
      this.store.dispatch(setResultAspect({aspect: val!}));
    })
  }
}
