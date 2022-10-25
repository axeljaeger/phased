import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';


import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MenuLeftComponent } from './menu-left/menu-left.component';
import { View3dComponent } from './view3d/view3d.component';

import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { ReactiveFormsModule } from '@angular/forms';

import { ToolbarComponent } from './toolbar/toolbar.component';
import { StoreModule } from '@ngrx/store';
import { ReactiveComponentModule } from '@ngrx/component'
import { EffectsModule } from '@ngrx/effects';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';

import { environmentReducer } from './store/reducers/environment.reducer'
import { arrayConfigReducer } from './store/reducers/arrayConfig.reducer'
import { environment } from 'src/environments/environment';
import { StorybookTestbedComponent } from './storybook-testbed/storybook-testbed.component';

import { ExcitationRendererEffects } from './excitation-renderer.effects';
import { RayleighRendererEffects } from './rayleigh-renderer.effects';
import { FarfieldRendererEffects } from './farfield-renderer.effects';

@NgModule({
  declarations: [
    AppComponent,
    MenuLeftComponent,
    View3dComponent,
    ToolbarComponent,
    StorybookTestbedComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatButtonToggleModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatSidenavModule,
    ReactiveFormsModule,
    ReactiveComponentModule,
    StoreModule.forRoot({
      environment: environmentReducer,
      arrayConfig: arrayConfigReducer
    }, {}),
    StoreDevtoolsModule.instrument({
      maxAge: 25, // Retains last 25 states
      logOnly: environment.production, // Restrict extension to log-only mode
    }),
    EffectsModule.forRoot([
      ExcitationRendererEffects,
    //  RayleighRendererEffects,
      FarfieldRendererEffects
    ])

  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
