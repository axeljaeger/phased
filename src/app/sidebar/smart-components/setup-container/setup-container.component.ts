import { Component, inject } from '@angular/core';

import { Store } from '@ngrx/store';
import { beamformingFeature } from '../../../store/beamforming.state';
import { arrayConfigFeature } from '../../../store/arrayConfig.state';


import { ArrayConfigComponent } from '../../smart-components/array-config/array-config.component';
import { BeamformingComponent } from '../../smart-components/beamforming/beamforming.component';
import { EnvironmentComponent } from '../../pure-components/environment/environment.component';
import { ExcitationComponent } from '../../pure-components/excitation/excitation.component';
import { MatAccordion, MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle } from '@angular/material/expansion';
import { MatIcon } from '@angular/material/icon';
import { TransducerComponent } from '../../pure-components/transducer/transducer.component';

@Component({
  selector: 'app-setup-container',
  imports: [
    ArrayConfigComponent,
    BeamformingComponent,
    EnvironmentComponent,
    ExcitationComponent,
    MatAccordion,
    MatExpansionPanel,
    MatExpansionPanelTitle,
    MatExpansionPanelHeader,
    MatIcon,
    TransducerComponent
  ],
  templateUrl: './setup-container.component.html',
  styleUrl: './setup-container.component.scss'
})
export class SetupContainerComponent {
    private store = inject(Store);
    public beamformingEnabled = this.store.selectSignal(beamformingFeature.selectEnabled);
    public environment = this.store.selectSignal(arrayConfigFeature.selectEnvironment);
}
