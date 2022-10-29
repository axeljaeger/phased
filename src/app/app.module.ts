import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';


import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MatSidenavModule } from '@angular/material/sidenav';

import { SidebarModule } from './sidebar/sidebar.module';
import { View3dComponent } from './view3d/view3d.component';

import { ToolbarComponent } from './toolbar/toolbar.component';
import { StoreModule } from '@ngrx/store';

import { EffectsModule } from '@ngrx/effects';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';

import { environmentReducer } from './store/reducers/environment.reducer'
import { arrayConfigReducer } from './store/reducers/arrayConfig.reducer'
import { environment } from 'src/environments/environment';
import { StorybookTestbedComponent } from './storybook-testbed/storybook-testbed.component';

import { ExcitationRendererEffects } from './store/effects/excitation-renderer.effects';
import { RayleighRendererEffects } from './store/effects/rayleigh-renderer.effects';
import { FarfieldRendererEffects } from './store/effects/farfield-renderer.effects';
import { viewportConfigReducer } from './store/reducers/viewportConfig.reducer';
import { rayleighReducer } from './store/reducers/rayleigh.reducer';

@NgModule({
  declarations: [
    AppComponent,
    View3dComponent,
    ToolbarComponent,
    StorybookTestbedComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatSidenavModule,
    SidebarModule,
    StoreModule.forRoot({
      environment: environmentReducer,
      arrayConfig: arrayConfigReducer,
      visibleResults: viewportConfigReducer,
      rayleigh: rayleighReducer
    }, {}),
    StoreDevtoolsModule.instrument({
      maxAge: 25, // Retains last 25 states
      logOnly: environment.production, // Restrict extension to log-only mode
    }),
    EffectsModule.forRoot([
      ExcitationRendererEffects,
      RayleighRendererEffects,
      FarfieldRendererEffects,
    ])

  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
