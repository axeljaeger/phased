import { Component, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { ArrayConfig } from 'src/app/store/arrayConfig.state';

@Component({
  selector: 'app-info',
  imports: [
    MatCardModule,
  ],
  templateUrl: './info.component.html',
  styleUrl: './info.component.scss'
})
export class InfoComponent {
  array = input<ArrayConfig>();
}
