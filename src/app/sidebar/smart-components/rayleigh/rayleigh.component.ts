import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { ResultAspect } from '../../../view3d/materials/rayleigh.material';

import { MatRadioModule } from '@angular/material/radio';
import { MatDividerModule } from '@angular/material/divider';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { NgIf, AsyncPipe } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';
import { Results, ViewportFeature, setResultVisible } from 'src/app/store/viewportConfig.state';
import { setResultAspect } from 'src/app/store/rayleigh.state';

@Component({
    selector: 'app-rayleigh',
    templateUrl: './rayleigh.component.html',
    styleUrls: ['./rayleigh.component.css'],
    standalone: true,
    imports: [MatExpansionModule, NgIf, MatIconModule, MatCheckboxModule, ReactiveFormsModule, MatDividerModule, MatRadioModule, AsyncPipe]
})
export class RayleighComponent implements OnInit {
  public rayleighVisible$ = this.store.select(ViewportFeature.selectResultEnabled(Results.RayleighIntegral));
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
    this.rayleighVisible$.subscribe(val => this.rayleighVisible.patchValue(val, {emitEvent: false}));
  }
}
