import { AsyncPipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Store } from '@ngrx/store';
import { BeamformingActions, beamformingFeature } from 'src/app/store/beamforming.state';

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
    beamformingInteractive: this.fb.control(false),
    beamformingU: this.fb.control(0),
    beamformingV: this.fb.control(0),
  });

  public beamformingEnabled = this.fb.control(false);
  public beamformingInteractive = this.fb.control(false);

  resetBeamforming() {
    this.store.dispatch(BeamformingActions.reset());
  }

  ngOnInit(): void {
    this.fg.valueChanges.subscribe(val => {
      this.store.dispatch(BeamformingActions.set({
        enabled: val.beamformingEnabled!,
        interactive: val.beamformingInteractive!,
        u: val.beamformingU!,
        v: val.beamformingV!
      }));
    });
  
    this.store.select(beamformingFeature.selectBeamformingState).subscribe(config => {
      this.fg.patchValue({
        beamformingEnabled: config.enabled,
        beamformingInteractive: config.interactive,
        beamformingU: config.u,
        beamformingV: config.v
      }, 
        { 
          emitEvent: false, // Avoid infinite recursion
        });
    });
  }
}
