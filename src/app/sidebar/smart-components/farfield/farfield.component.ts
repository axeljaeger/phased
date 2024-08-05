import { Component, OnInit, inject } from '@angular/core';

import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';

import { MatSliderModule } from '@angular/material/slider';
import { MatDividerModule } from '@angular/material/divider';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { AsyncPipe } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';
import { Results, ViewportFeature, setResultVisible } from 'src/app/store/viewportConfig.state';

@Component({
    selector: 'app-farfield',
    templateUrl: './farfield.component.html',
    styleUrls: ['./farfield.component.scss'],
    standalone: true,
    imports: [MatExpansionModule, MatIconModule, MatCheckboxModule, ReactiveFormsModule, MatDividerModule, MatSliderModule, AsyncPipe]
})
export class FarfieldComponent implements OnInit {
  store = inject(Store);
  fb = inject(FormBuilder);
  
  public farfieldVisible = this.fb.control(false);
  public tesselationLevel = this.fb.control(1);

  ngOnInit(): void {
    this.farfieldVisible.valueChanges.subscribe(val => {
      this.store.dispatch(setResultVisible({result: Results.Farfield, visible: val!}));
    });
  }
}
