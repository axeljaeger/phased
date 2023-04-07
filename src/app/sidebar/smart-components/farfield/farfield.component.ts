import { Component, OnInit } from '@angular/core';

import { FormBuilder } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Results } from '../../../store';
import { setResultVisible } from '../../../store/actions/viewportConfig.actions';

import { selectResultEnabled } from '../../../store/selectors/viewportConfig.selector';

@Component({
  selector: 'app-farfield',
  templateUrl: './farfield.component.html',
  styleUrls: ['./farfield.component.css']
})
export class FarfieldComponent implements OnInit {
  public farfieldVisible$ = this.store.select(selectResultEnabled(Results.Farfield));
  public farfieldVisible = this.fb.control(false);
  public tesselationLevel = this.fb.control(1);

  constructor(
    private store: Store,
    private fb: FormBuilder) { }

  ngOnInit(): void {

    this.farfieldVisible.valueChanges.subscribe(val => {
      this.store.dispatch(setResultVisible({result: Results.Farfield, visible: val!}));
    });
  }

}
