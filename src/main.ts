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
import { rayleighFeature } from './app/store/rayleigh.state';
import { beamformingFeature } from './app/store/beamforming.state';
import { arrayConfigFeature } from './app/store/arrayConfig.state';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
    providers: [
        provideStore(),
        provideState(arrayConfigFeature),
        provideState(environmentFeature),
        provideState(rayleighFeature),
        provideState(selectionFeature),
        provideState(ViewportFeature),
        provideState(beamformingFeature),
        provideStoreDevtools({
            maxAge: 25,
            logOnly: environment.production, // Restrict extension to log-only mode
         connectInZone: true}),
        provideAnimations()
    ]
})
  .catch(err => console.error(err));
