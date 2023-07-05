import { enableProdMode, importProvidersFrom } from '@angular/core';

import { environment } from './environments/environment';
import { AppComponent } from './app/app.component';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { viewportConfigReducer } from './app/store/reducers/viewportConfig.reducer';
import { selectionReducer } from './app/store/reducers/selection.reducer';
import { rayleighReducer } from './app/store/reducers/rayleigh.reducer';
import { environmentReducer } from './app/store/reducers/environment.reducer';
import { arrayConfigReducer } from './app/store/reducers/arrayConfig.reducer';
import { StoreModule } from '@ngrx/store';
import { MatSidenavModule } from '@angular/material/sidenav';
import { provideAnimations } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app/app-routing.module';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
    providers: [
        importProvidersFrom(BrowserModule, AppRoutingModule, MatSidenavModule, StoreModule.forRoot({
            arrayConfig: arrayConfigReducer,
            environment: environmentReducer,
            rayleigh: rayleighReducer,
            selection: selectionReducer,
            visibleResults: viewportConfigReducer,
        }, {}), StoreDevtoolsModule.instrument({
            maxAge: 25,
            logOnly: environment.production, // Restrict extension to log-only mode
        })),
        provideAnimations()
    ]
})
  .catch(err => console.error(err));
