import { Component, effect, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Component, inject } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';

import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Angle } from '@babylonjs/core/Maths/math.path';
import { NormalizeRadians } from '@babylonjs/core/Maths/math.scalar.functions';
import { StoreService } from 'src/app/store/store.service';
import { JoystickComponent } from '../joystick/joystick.component';
import { map } from 'rxjs';
import { azElToUV } from 'src/app/utils/uv';

const normalizeAngle = (angle: number) => {
  return angle > 180 ? angle - 360 : angle;
};

@Component({
    selector: 'app-beamforming',
    imports: [
    MatButtonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    ReactiveFormsModule,
    JoystickComponent
],
    templateUrl: './beamforming.component.html',
    styleUrl: './beamforming.component.scss'
})
export class BeamformingComponent {
  store = inject(StoreService);  
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

  beamformingEnabled = toSignal(this.fg.valueChanges.pipe(takeUntilDestroyed()).pipe(map(val => val.beamformingEnabled)));
  positionUV = toSignal(this.fg.valueChanges.pipe(takeUntilDestroyed()).pipe(map(val => ({ x: val.beamformingU ?? 0, y: val.beamformingV ?? 0 }))));

  resetBeamforming() {
    this.store.resetBeamforming();
  }

  constructor() {
    this.fg.valueChanges.pipe(takeUntilDestroyed()).subscribe(val => {     
      
      this.store.setPartial({
        enabled: val.beamformingEnabled!,
        interactive: val.beamformingInteractive!,
        ...(val.beamformingU !== undefined && val.beamformingU !== null) ? { u: val.beamformingU} : {},
        ...(val.beamformingV !== undefined && val.beamformingV !== null) ? { v: val.beamformingV} : {},
      });

      [
        this.fg.controls.beamformingU,
        this.fg.controls.beamformingV,
        this.anglesGroup.controls.az,
        this.anglesGroup.controls.el,
        this.fg.controls.beamformingInteractive,
      ].forEach(c => val.beamformingEnabled ? c.enable({emitEvent: false}) : c.disable({emitEvent: false}));
    });

    this.anglesGroup.valueChanges.pipe(takeUntilDestroyed()).subscribe(val => {
      const az = Angle.FromDegrees(val.az!).radians();
      const el = Angle.FromDegrees(val.el!).radians();
      
      const u = Math.cos(el) * Math.sin(az);
      const v = Math.sin(el);

      this.store.setU(u);
      this.store.setV(v);
    });


    effect(() => {
      const config = this.store.beamforming();
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

  setAZEL($event: { x: number; y: number; }) {
    console.log($event)
    const uv = azElToUV(-$event.x, -$event.y);
    this.store.dispatch(BeamformingActions.set(uv));
  }  
}
