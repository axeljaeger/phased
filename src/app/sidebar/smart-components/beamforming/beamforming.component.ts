import { Component, computed, effect, inject } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';

import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Angle } from '@babylonjs/core/Maths/math.path';
import { StoreService } from 'src/app/store/store.service';
import { JoystickComponent } from '../joystick/joystick.component';
import { azElToUV, uv2azel } from 'src/app/utils/uv';
import { UVCoordinates } from 'src/app/store/beamforming.state';

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
  });

  anglesGroup = this.fb.group({
    az: this.fb.control({ value: 0, disabled: true }),
    el: this.fb.control({ value: 0, disabled: true }),
  });

  fgs = toSignal(this.fg.valueChanges.pipe(takeUntilDestroyed()));
  beamformingEnabled = computed(() => this.fgs()?.beamformingEnabled);
  positionUV = this.store.beamforming;
  
  resetBeamforming() {
    this.store.resetBeamforming();
  }

  constructor() {
    this.fg.valueChanges.pipe(takeUntilDestroyed()).subscribe(val => {     
      
      this.store.setPartial({
        enabled: val.beamformingEnabled!,
        interactive: val.beamformingInteractive!,
      });

      [
        this.anglesGroup.controls.az,
        this.anglesGroup.controls.el,
        this.fg.controls.beamformingInteractive,
      ].forEach(c => val.beamformingEnabled ? c.enable({emitEvent: false}) : c.disable({emitEvent: false}));
    });

    this.anglesGroup.valueChanges.pipe(takeUntilDestroyed()).subscribe(val => {
      const az = Angle.FromDegrees(val.az!).radians();
      const el = Angle.FromDegrees(val.el!).radians();
      this.store.setPartial(azElToUV(az, el));
    });

    effect(() => {
      const config = this.store.beamforming();
      this.fg.patchValue({
        beamformingEnabled: config?.enabled,
        beamformingInteractive: config?.interactive,
      }, 
      { 
        emitEvent: false,
      });

      const azEL = uv2azel({u: config.u, v: config.v});
      const azElDeg = {
        az: normalizeAngle(Angle.FromRadians(azEL.az).degrees()),
        el: normalizeAngle(Angle.FromRadians(azEL.el).degrees())
      }

      config && this.anglesGroup.patchValue(azElDeg, 
      { 
        emitEvent: false, // Avoid infinite recursion
      });      
    });
  }

  setUV(uv: UVCoordinates) {
    this.store.setPartial(uv);
  }  
}
