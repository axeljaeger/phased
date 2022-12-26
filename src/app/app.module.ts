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

import { FarfieldRendererEffects } from './store/effects/farfield-renderer.effects';
import { viewportConfigReducer } from './store/reducers/viewportConfig.reducer';
import { rayleighReducer } from './store/reducers/rayleigh.reducer';
import { selectionReducer } from './store/reducers/selection.reducer';

import { ExcitationComponent } from './view3d/excitation/excitation.component';
import { RayleighIntegralComponent } from './view3d/rayleigh-integral/rayleigh-renderer.component';

import { LetModule } from '@ngrx/component';

@NgModule({
  declarations: [
    AppComponent,
    View3dComponent,
    ExcitationComponent,
    RayleighIntegralComponent,
    ToolbarComponent,
    StorybookTestbedComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    LetModule,
    MatSidenavModule,
    SidebarModule,
    StoreModule.forRoot({
      environment: environmentReducer,
      arrayConfig: arrayConfigReducer,
      visibleResults: viewportConfigReducer,
      rayleigh: rayleighReducer,
      selection: selectionReducer
    }, {}),
    StoreDevtoolsModule.instrument({
      maxAge: 25, // Retains last 25 states
      logOnly: environment.production, // Restrict extension to log-only mode
    }),
    EffectsModule.forRoot([
      FarfieldRendererEffects,
    ])

  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
