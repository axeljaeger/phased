import { Component, computed, inject } from '@angular/core';
import { FarfieldComponent } from '../../smart-components/farfield/farfield.component';
import { RayleighComponent } from '../../smart-components/rayleigh/rayleigh.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { ChartComponent } from '../../smart-components/chart/chart.component';
import { createSelector, Store } from '@ngrx/store';
import { arrayConfigFeature } from 'src/app/store/arrayConfig.state';
import { MatIconModule } from '@angular/material/icon';
import { Results, ViewportFeature } from 'src/app/store/viewportConfig.state';

import { version } from '../../../../../package.json';
import { KPIComponent } from '../kpi/kpi.component';
import { ApertureViewComponent } from '../aperture-view/aperture-view.component';

@Component({
    selector: 'app-result-container',
    templateUrl: './result-container.component.html',
    styleUrls: ['./result-container.component.scss'],
    imports: [
        ChartComponent,
        FarfieldComponent,
        MatExpansionModule,
        MatIconModule,
        KPIComponent,
        ApertureViewComponent,
        RayleighComponent
    ]
})
export class ResultContainerComponent {
    public version = version;
    private store = inject(Store);
    kpis = this.store.selectSignal(createSelector(
        arrayConfigFeature.selectFnbw,
        arrayConfigFeature.selectHpbw,
        (fnbw, hpbw) => ({ fnbw, hpbw })
    ));
    public farfieldVisible = this.store.selectSignal(ViewportFeature.selectResultEnabled(Results.Farfield));
    public transducers = this.store.selectSignal(arrayConfigFeature.selectTransducers);
    public diameter = this.store.selectSignal(arrayConfigFeature.selectTransducerDiameter);
    public transducersCount = computed(() => this.transducers().length);
    public rayleighVisible = this.store.selectSignal(ViewportFeature.selectResultEnabled(Results.RayleighIntegral));
}
