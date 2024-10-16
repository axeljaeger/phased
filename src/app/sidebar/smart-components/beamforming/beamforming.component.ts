import { AsyncPipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Angle } from '@babylonjs/core/Maths/math.path';
import { NormalizeRadians } from '@babylonjs/core/Maths/math.scalar.functions';
import { Store } from '@ngrx/store';
import { BeamformingActions, beamformingFeature } from 'src/app/store/beamforming.state';

const normalizeAngle = (angle: number) => {
  return angle > 180 ? angle - 360 : angle;
};

@Component({
  selector: 'app-beamforming',
  standalone: true,
  imports: [
    AsyncPipe,
    MatButtonModule, 
    MatCheckboxModule,
    MatExpansionModule, 
    MatFormFieldModule, 
    MatIconModule, 
    MatInputModule,
    ReactiveFormsModule
  ],
  templateUrl: './beamforming.component.html',
  styleUrl: './beamforming.component.scss'
})
export class BeamformingComponent implements OnInit {
  store = inject(Store);  
  fb = inject(FormBuilder);

  fg = this.fb.group({
    beamformingEnabled: this.fb.control(false),
    beamformingInteractive: this.fb.control({value: false, disabled: true}),
    beamformingU: this.fb.control({value: 0, disabled: true}),
    beamformingV: this.fb.control({value: 0, disabled: true}),
  });

  anglesGroup = this.fb.group({
    az: this.fb.control({ value: 5, disabled: true }),
    el: this.fb.control({ value: 3, disabled: true }),
  });

  resetBeamforming() {
    this.store.dispatch(BeamformingActions.reset());
  }

  ngOnInit(): void {
    this.fg.valueChanges.subscribe(val => {
      console.log(val);
      
      this.store.dispatch(BeamformingActions.set({
        enabled: val.beamformingEnabled!,
        interactive: val.beamformingInteractive!,
        ...(val.beamformingU !== undefined && val.beamformingU !== null) ? { u: val.beamformingU} : {},
        ...(val.beamformingV !== undefined && val.beamformingV !== null) ? { v: val.beamformingV} : {},
      }));

      [
        this.fg.controls.beamformingU,
        this.fg.controls.beamformingV,
        this.anglesGroup.controls.az,
        this.anglesGroup.controls.el,
        this.fg.controls.beamformingInteractive,
      ].forEach(c => val.beamformingEnabled ? c.enable({emitEvent: false}) : c.disable({emitEvent: false}));
    });

    this.anglesGroup.valueChanges.subscribe(val => {
      const az = Angle.FromDegrees(val.az!).radians();
      const el = Angle.FromDegrees(val.el!).radians();
      
      const u = Math.cos(el) * Math.sin(az);
      const v = Math.sin(el);

      this.store.dispatch(BeamformingActions.setU({ u }));
      this.store.dispatch(BeamformingActions.setV({ v }));
    });

    this.store.select(beamformingFeature.selectBeamformingState).subscribe(config => {
      console.log("Config: ", config);
      this.fg.patchValue({
        beamformingEnabled: config?.enabled,
        beamformingInteractive: config?.interactive,
        beamformingU: config?.u,
        beamformingV: config?.v
      }, 
      { 
        emitEvent: false, // Avoid infinite recursion
      });

      config && this.anglesGroup.patchValue({
        az: normalizeAngle(Angle.FromRadians(NormalizeRadians(Math.atan(config.u / Math.sqrt(1 - config.u**2 - config.v**2)))).degrees()),
        el: normalizeAngle(Angle.FromRadians(NormalizeRadians(Math.asin(config.v))).degrees()),
      }, 
      { 
        emitEvent: false, // Avoid infinite recursion
      });
    });
  }
}
