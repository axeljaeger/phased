import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { SidebarContainerComponent } from './sidebar/pure-components/sidebar-container/sidebar-container.component';
import { View3dComponent } from './view3d/smart-components/view3d/view3d.component';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    imports: [MatSidenavModule, RouterOutlet, SidebarContainerComponent, View3dComponent]
})
export class AppComponent {

}
