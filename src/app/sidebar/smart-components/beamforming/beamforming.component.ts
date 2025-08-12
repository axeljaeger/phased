import { Component, effect, inject, input } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Angle } from '@babylonjs/core/Maths/math.path';
import { StoreService } from 'src/app/store/store.service';
import { JoystickComponent } from '../joystick/joystick.component';
import { AzElCoordinates } from 'src/app/store/beamforming.state';
import { deg2rad } from 'src/app/utils/degrad';

const normalizeAngle = (angle: number) => {
  return angle > 180 ? angle - 360 : angle;
};

const cleanNullish = <T extends object>(obj: T): Partial<T> =>
  Object.fromEntries(
    Object.entries(obj).filter(([_, v]) => v != null)
  ) as Partial<T>;

const transformFormPatch = (
  patch: Partial<{ beamformingEnabled: boolean | null; az: number | null; el: number | null; }>
) => {
  const clean = cleanNullish(patch) as { beamformingEnabled?: boolean; az?: number; el?: number; };

  if (typeof clean.az === 'number') clean.az = deg2rad(clean.az);
  if (typeof clean.el === 'number') clean.el = deg2rad(clean.el);

  return clean;
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
  beamformingEnabled = input(false);

  store = inject(StoreService);
  
  fb = inject(FormBuilder);
  fg = this.fb.group({
    beamformingEnabled: this.fb.control(false),
    az: this.fb.control({ value: 0, disabled: true }),
    el: this.fb.control({ value: 0, disabled: true }),
  });

  beamforming = this.store.beamforming;

  propagateBeamformingEnabled = effect(() => {
    const bfe = this.beamformingEnabled();
      [
        this.fg.controls.az,
        this.fg.controls.el,
      ].forEach(c => bfe ? c.enable({emitEvent: false}) : c.disable({emitEvent: false}));
  })

  updateStoreFromForm = this.fg.valueChanges.pipe(takeUntilDestroyed()).subscribe(
    val => this.store.setPartial(transformFormPatch(val)));

  updateFormFromStore = effect(() => {
    const bf = this.store.beamforming();
    this.fg.patchValue({
      beamformingEnabled: bf?.beamformingEnabled,
      az: normalizeAngle(Angle.FromRadians(bf.az).degrees()),
      el: normalizeAngle(Angle.FromRadians(bf.el).degrees())
    }, { emitEvent: false });
  });
  
  resetBeamforming() {
    this.store.resetBeamforming();
  }

  setAzEl(azel: AzElCoordinates) {
    this.store.setPartial(azel);
  }  
}
