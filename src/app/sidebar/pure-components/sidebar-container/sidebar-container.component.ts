import { Component, inject, model } from '@angular/core';
import { ArrayConfigComponent } from '../../smart-components/array-config/array-config.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { BeamformingComponent } from '../../smart-components/beamforming/beamforming.component';
import { Store } from '@ngrx/store';
import { ArrayConfig, ArrayConfigActions, arrayConfigFeature } from 'src/app/store/arrayConfig.state';
import { beamformingFeature } from 'src/app/store/beamforming.state';
import { MatIcon } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';

import { MatButtonToggle, MatButtonToggleGroup } from '@angular/material/button-toggle';
import { LibraryComponent } from '../library/library.component';

import { EnvironmentComponent } from '../environment/environment.component';
import { ExcitationComponent } from '../excitation/excitation.component';

import { version } from '../../../../../package.json';
import { InfoComponent } from '../info/info.component';
import { TransducerComponent } from '../transducer/transducer.component';
import { ExportComponent } from '../export/export.component';

export type SidebarTab = 'library' | 'setup' | 'export'; 
@Component({
    selector: 'app-sidebar-container',
    templateUrl: './sidebar-container.component.html',
    styleUrls: ['./sidebar-container.component.scss'],
    imports: [
        ArrayConfigComponent,
        BeamformingComponent,
        EnvironmentComponent,
        ExcitationComponent,
        ExportComponent,
        FormsModule,
        InfoComponent,
        LibraryComponent,
        MatButtonToggle,
        MatButtonToggleGroup,
        MatExpansionModule,
        MatIcon,
        TransducerComponent
    ]
})
export class SidebarContainerComponent {
    private store = inject(Store);
    public beamformingEnabled = this.store.selectSignal(beamformingFeature.selectEnabled);
    public transducers = this.store.selectSignal(arrayConfigFeature.selectTransducers);
    public environment = this.store.selectSignal(arrayConfigFeature.selectEnvironment);
    public array = this.store.selectSignal(arrayConfigFeature.selectArrayConfigState);

    public version = version;

    selectedTab = model<SidebarTab>('library');
    
    loadPreset(preset: ArrayConfig) {
        this.store.dispatch(ArrayConfigActions.setConfig(preset));
    }
}
