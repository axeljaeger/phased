import { Component, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { Citation } from 'src/app/store/store.service';

// FIXME: Rename to citation
@Component({
  selector: 'app-info',
  imports: [
    MatCardModule,
  ],
  templateUrl: './info.component.html',
  styleUrl: './info.component.scss'
})
export class InfoComponent {
  citation = input<Citation | null>();
}
