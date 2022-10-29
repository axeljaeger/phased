import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Results } from 'src/app/store';
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

  constructor(
    private store: Store,
    private fb: FormBuilder) { }

  ngOnInit(): void {
    this.rayleighVisible.valueChanges.subscribe(val => {
      this.store.dispatch(setResultVisible({result: Results.RayleighIntegral, visible: val!}));
    });
  }
}
