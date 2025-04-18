import { Component, computed, inject } from '@angular/core';
import { FarfieldComponent } from '../../smart-components/farfield/farfield.component';
import { RayleighComponent } from '../../smart-components/rayleigh/rayleigh.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { ChartComponent } from '../../smart-components/chart/chart.component';
import { MatIconModule } from '@angular/material/icon';
import { Results } from 'src/app/store/viewportConfig.state';

import { version } from '../../../../../package.json';
import { HoveredKpi, KPIComponent } from '../kpi/kpi.component';
import { ApertureViewComponent } from '../aperture-view/aperture-view.component';
import { StoreService } from 'src/app/store/store.service';

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
    private store = inject(StoreService);
    // FIXME: this should be moved to the store
    kpis = computed(() => ({
        u: { fnbw: this.store.fnbwU(), hpbw: this.store.hpbwU() }, 
        v: { fnbw: this.store.fnbwV(), hpbw: this.store.hpbwV() }
    }));

    public farfieldVisible = computed(() => this.store.enabledResults().includes(Results.Farfield));
    public transducers = this.store.transducers;
    public diameter = computed(() => this.store.arrayConfig().transducerDiameter);
    public arrayDiameter = computed(() => {
        const config = this.store.arrayConfig().config;
        if (config.type === 'circular' || config.type === 'spiral') {
            return config.diameter
        }
        return null;
    });
    public transducersCount = computed(() => this.transducers().length);
    public rayleighVisible = computed(() => this.store.enabledResults().includes(Results.RayleighIntegral));
    public setHoveredKpi(hoveredKpi: HoveredKpi) {
        this.store.setHoveredKpi(hoveredKpi);
    }
}
