import { Component, inject } from '@angular/core';
import { FarfieldComponent } from '../../smart-components/farfield/farfield.component';
import { RayleighComponent } from '../../smart-components/rayleigh/rayleigh.component';
import { TransducerListComponent } from '../../smart-components/transducer-list/transducer-list.component';
import { ArrayConfigComponent } from '../../smart-components/array-config/array-config.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { ChartComponent } from '../../smart-components/chart/chart.component';
import { BeamformingComponent } from '../../smart-components/beamforming/beamforming.component';
import { Store } from '@ngrx/store';
import { arrayConfigFeature } from 'src/app/store/arrayConfig.state';
import { map } from 'rxjs/operators';
import { AsyncPipe } from '@angular/common';
import { beamformingFeature } from 'src/app/store/beamforming.state';
import { MatIconModule } from '@angular/material/icon';
import { Results, ViewportFeature } from 'src/app/store/viewportConfig.state';

import { version } from '../../../../../package.json';

@Component({
    selector: 'app-sidebar-container',
    templateUrl: './sidebar-container.component.html',
    styleUrls: ['./sidebar-container.component.scss'],
    standalone: true,
    imports: [
        AsyncPipe,
        ArrayConfigComponent, 
        ChartComponent,
        FarfieldComponent,
        MatExpansionModule,
        MatIconModule, 
        RayleighComponent, 
        TransducerListComponent,
        BeamformingComponent
    ]
})
export class SidebarContainerComponent {
    public version = version;
    private store = inject(Store);
    public transducersCount$ = this.store.select(arrayConfigFeature.selectTransducers).pipe(map(transducers => transducers.length));
    public beamformingEnabled$ = this.store.select(beamformingFeature.selectEnabled);
    public rayleighVisible$ = this.store.select(ViewportFeature.selectResultEnabled(Results.RayleighIntegral));
    public farfieldVisible$ = this.store.select(ViewportFeature.selectResultEnabled(Results.Farfield));
}
