import { enableProdMode } from '@angular/core';

import { environment } from './environments/environment';
import { AppComponent } from './app/app.component';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { selectionFeature } from './app/store/selection.state';
import { provideState, provideStore } from '@ngrx/store';
import { provideAnimations } from '@angular/platform-browser/animations';
import { bootstrapApplication } from '@angular/platform-browser';
import { ViewportFeature } from './app/store/viewportConfig.state';
import { RayleighFeature } from './app/store/rayleigh.state';
import { beamformingFeature } from './app/store/beamforming.state';
import { arrayConfigFeature } from './app/store/arrayConfig.state';
import { exportFeature } from './app/store/export.state';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { provideRouter, Routes } from '@angular/router';
import { ExportComponent } from './app/sidebar/pure-components/export/export.component';
import { SetupContainerComponent } from './app/sidebar/smart-components/setup-container/setup-container.component';
import { LibraryContainerComponent } from './app/sidebar/smart-components/library-container/library-container.component';

if (environment.production) {
  enableProdMode();
}

const routes : Routes = [
  { path: 'library', component: LibraryContainerComponent },
  { path: 'setup', component: SetupContainerComponent },
  { path: 'export', component: ExportComponent },
];

bootstrapApplication(AppComponent, {
    providers: [
        provideAnimations(),
        { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { appearance: 'outline' } },
        provideStore(),
        provideState(arrayConfigFeature),
        provideState(beamformingFeature),
        provideState(exportFeature),
        provideState(RayleighFeature),
        provideState(selectionFeature),
        provideState(ViewportFeature),
        provideRouter(routes),
        provideStoreDevtools({
            maxAge: 25,
            logOnly: environment.production, // Restrict extension to log-only mode
         connectInZone: true}),

    ]
})
  .catch(err => console.error(err));
