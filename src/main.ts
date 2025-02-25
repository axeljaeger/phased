import { enableProdMode } from '@angular/core';

import { environment } from './environments/environment';
import { AppComponent } from './app/app.component';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { selectionFeature } from './app/store/selection.state';
import { environmentFeature } from './app/store/environment.state';
import { provideState, provideStore } from '@ngrx/store';
import { provideAnimations } from '@angular/platform-browser/animations';
import { bootstrapApplication } from '@angular/platform-browser';
import { ViewportFeature } from './app/store/viewportConfig.state';
import { RayleighFeature } from './app/store/rayleigh.state';
import { beamformingFeature } from './app/store/beamforming.state';
import { arrayConfigFeature } from './app/store/arrayConfig.state';
import { exportFeature } from './app/store/export.state';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
    providers: [
        provideStore(),
        provideAnimations(),
        { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { appearance: 'outline' } },
        provideState(arrayConfigFeature),
        provideState(environmentFeature),
        provideState(RayleighFeature),
        provideState(selectionFeature),
        provideState(ViewportFeature),
        provideState(beamformingFeature),
        provideState(exportFeature),
        provideStoreDevtools({
            maxAge: 25,
            logOnly: environment.production, // Restrict extension to log-only mode
         connectInZone: true}),

    ]
})
  .catch(err => console.error(err));
