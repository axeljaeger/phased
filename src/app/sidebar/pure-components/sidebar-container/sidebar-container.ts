import { Component } from '@angular/core';
import { FarfieldComponent } from '../../smart-components/farfield/farfield.component';
import { RayleighComponent } from '../../smart-components/rayleigh/rayleigh.component';
import { TransducerListComponent } from '../../smart-components/transducer-list/transducer-list.component';
import { ArrayConfigComponent } from '../../smart-components/array-config/array-config.component';
import { MatExpansionModule } from '@angular/material/expansion';


@Component({
    selector: 'app-sidebar-container',
    templateUrl: './sidebar-container.component.html',
    styleUrls: ['./sidebar-container.component.css'],
    standalone: true,
    imports: [MatExpansionModule, ArrayConfigComponent, TransducerListComponent, RayleighComponent, FarfieldComponent]
})
export class SidebarContainerComponent {
  
}
