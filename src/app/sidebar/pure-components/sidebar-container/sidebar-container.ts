import { AfterContentChecked, Component } from '@angular/core';


@Component({
  selector: 'app-sidebar-container',
  templateUrl: './sidebar-container.component.html',
  styleUrls: ['./sidebar-container.component.css']
})
export class SidebarContainerComponent implements AfterContentChecked {
  ngAfterContentChecked(): void {
    // console.log("Content checked from sidebar");
  }
}
