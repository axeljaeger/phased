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
import { HoveredKpi, KPIComponent } from '../kpi/kpi.component';
import { ApertureViewComponent } from '../aperture-view/aperture-view.component';
import { ExportActions } from 'src/app/store/export.state';

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
        arrayConfigFeature.selectFnbwU,
        arrayConfigFeature.selectHpbwU,
        arrayConfigFeature.selectFnbwV,
        arrayConfigFeature.selectHpbwV,
        (fnbwu, hpbwu, fnbwv, hpbwv) => ( {u: { fnbw: fnbwu, hpbw: hpbwu }, v: { fnbw: fnbwv, hpbw: hpbwv }})));
    public farfieldVisible = this.store.selectSignal(ViewportFeature.selectResultEnabled(Results.Farfield));
    public transducers = this.store.selectSignal(arrayConfigFeature.selectTransducers);
    public diameter = this.store.selectSignal(arrayConfigFeature.selectTransducerDiameter);
    public arrayDiameter = computed(() => {
        const val = this.store.selectSignal(arrayConfigFeature.selectArrayConfigState)();
        if (val.config.type === 'circular' || val.config.type === 'spiral') {
            return val.config.diameter
        }
        return null;
    });
    public transducersCount = computed(() => this.transducers().length);
    public rayleighVisible = this.store.selectSignal(ViewportFeature.selectResultEnabled(Results.RayleighIntegral));
    public setHoveredKpi(hoveredKpi: HoveredKpi) {
        this.store.dispatch(ExportActions.setHoveredKpi({ hoveredKpi }));
    }
}
