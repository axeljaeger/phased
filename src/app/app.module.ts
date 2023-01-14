import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MatSidenavModule } from '@angular/material/sidenav';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';

import { AppRoutingModule } from './app-routing.module';
import { SidebarModule } from './sidebar/sidebar.module';
import { View3DModule } from './view3d/view3d.module';

import { AppComponent } from './app.component';
import { ToolbarComponent } from './toolbar/toolbar.component';

import { environment } from 'src/environments/environment';
import { StorybookTestbedComponent } from './storybook-testbed/storybook-testbed.component';

import { arrayConfigReducer } from './store/reducers/arrayConfig.reducer'
import { environmentReducer } from './store/reducers/environment.reducer'
import { rayleighReducer } from './store/reducers/rayleigh.reducer';
import { selectionReducer } from './store/reducers/selection.reducer';
import { viewportConfigReducer } from './store/reducers/viewportConfig.reducer';

@NgModule({
  declarations: [
    AppComponent,    
    ToolbarComponent,
    StorybookTestbedComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatSidenavModule,
    SidebarModule,
    StoreModule.forRoot({
      arrayConfig: arrayConfigReducer,
      environment: environmentReducer,
      rayleigh: rayleighReducer,
      selection: selectionReducer,
      visibleResults: viewportConfigReducer,
    }, {}),
    StoreDevtoolsModule.instrument({
      maxAge: 25, // Retains last 25 states
      logOnly: environment.production, // Restrict extension to log-only mode
    }),
    View3DModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
