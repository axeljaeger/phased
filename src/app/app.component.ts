import { Component } from '@angular/core';
import { View3dComponent } from './view3d/smart-components/view3d/view3d.component';
import { ResultContainerComponent } from './sidebar/pure-components/result-container/result-container.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { SidebarContainerComponent } from './sidebar/pure-components/sidebar-container/sidebar-container.component';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    imports: [ SidebarContainerComponent, View3dComponent, ResultContainerComponent, MatToolbarModule ]
})
export class AppComponent {}
